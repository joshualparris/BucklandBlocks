interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface OSMFootprintsResult {
  buildings: Array<{
    id: string;
    geometry: Array<[number, number]>;
    tags: Record<string, string>;
  }>;
  roads: Array<{
    id: string;
    geometry: Array<[number, number]>;
    tags: Record<string, string>;
  }>;
}

// In-memory cache to avoid hitting OSM APIs too frequently
const cache = new Map<string, any>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCacheKey(type: string, ...params: any[]): string {
  return `${type}:${params.join(':')}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const cacheKey = getCacheKey('geocode', address);
  const cached = getFromCache<GeocodeResult>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BucklandBlocks/1.0 (voxel game)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }

    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function fetchOSMFootprints(lat: number, lon: number, radius: number): Promise<OSMFootprintsResult> {
  const cacheKey = getCacheKey('footprints', lat, lon, radius);
  const cached = getFromCache<OSMFootprintsResult>(cacheKey);
  if (cached) return cached;

  const radiusInDegrees = radius / 111000; // Rough conversion from meters to degrees
  const bbox = {
    south: lat - radiusInDegrees,
    west: lon - radiusInDegrees,
    north: lat + radiusInDegrees,
    east: lon + radiusInDegrees,
  };

  const query = `
    [out:json][timeout:25];
    (
      way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["highway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      relation["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out geom;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'BucklandBlocks/1.0 (voxel game)',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    const buildings: OSMFootprintsResult['buildings'] = [];
    const roads: OSMFootprintsResult['roads'] = [];

    data.elements?.forEach((element: any) => {
      if (element.type === 'way' && element.geometry) {
        const geometry: Array<[number, number]> = element.geometry.map((node: any) => [node.lat, node.lon]);
        
        if (element.tags?.building) {
          buildings.push({
            id: element.id.toString(),
            geometry,
            tags: element.tags,
          });
        }
        
        if (element.tags?.highway) {
          roads.push({
            id: element.id.toString(),
            geometry,
            tags: element.tags,
          });
        }
      }
    });

    const result: OSMFootprintsResult = { buildings, roads };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('OSM footprints error:', error);
    return { buildings: [], roads: [] };
  }
}
