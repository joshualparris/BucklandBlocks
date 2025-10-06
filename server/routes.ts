import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geocodeAddress, fetchOSMFootprints } from "./osm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Geocode address endpoint
  app.get("/api/geocode", async (req, res) => {
    try {
      const address = req.query.address as string;
      if (!address) {
        return res.status(400).json({ error: "Address parameter is required" });
      }

      const result = await geocodeAddress(address);
      if (!result) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Geocode error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OSM footprints endpoint
  app.get("/api/footprints", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const radius = parseInt(req.query.radius as string) || 300;

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Valid lat and lon parameters are required" });
      }

      const result = await fetchOSMFootprints(lat, lon, radius);
      res.json(result);
    } catch (error) {
      console.error("OSM footprints error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
