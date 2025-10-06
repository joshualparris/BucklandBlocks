# Buckland Blocks

A browser-based voxel sandbox game that starts at 53 Buckland Street, Epsom VIC 3551 and recreates the local area using OpenStreetMap data. Built with modern web technologies and designed to be completely IP-safe with no references to existing proprietary games.

## Features

### Core Gameplay
- **First-person voxel engine** with chunked terrain rendering (16×16×128 chunks)
- **Mining and building** system with raycast block targeting
- **Inventory management** with 9-slot hotbar and full inventory screen
- **Crafting system** with 2×2 crafting grid and JSON-based recipes
- **Block physics** with AABB collision detection
- **Day/night cycle** with dynamic lighting

### World Generation
- **OpenStreetMap integration** - real-world building footprints and roads
- **Procedural terrain** using noise-based height maps
- **Building reconstruction** - OSM polygons extruded into liveable structures
- **Biome system** with grass, dirt, stone, and sand terrains

### Technical Features
- **Chunked rendering** with frustum culling for performance
- **Greedy meshing** for optimized geometry generation  
- **World persistence** using localStorage (chunk diffs + inventory)
- **Performance optimizations** - dirty chunk tracking, object pooling
- **Real-time lighting** with shadows and emissive blocks

## Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with WebGL support

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
