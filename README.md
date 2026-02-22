# OpenPasture

An open-source intelligence layer for adaptive grazing. See [docs/vision.md](docs/vision.md) for the thesis and product philosophy.

## Features

### Digital Twin of Your Farm
- Define farm boundaries and pasture zones
- Track herd metadata (species, count)
- Visualize all zones on an interactive map

### Satellite-Derived Land Intelligence
- Vegetation health metrics (NDVI, EVI)
- Relative forage availability by pasture
- Regrowth trends over time
- Over/under-utilization indicators

### Daily Recommendations
- Which pasture to graze today
- Suggested area and duration
- Confidence score and assumptions
- Plain-language explanations

### Flexible Output
- Visual fence geometry for planning
- Copy-ready instructions for third-party virtual fencing tools
- Manual execution guidance

## Technical Approach

### Satellite Imaging

We use publicly available satellite imagery (primarily Sentinel-2) to compute vegetation indices across your farm. This provides:

- Scalable, low-cost land sensing
- Multispectral data for vegetation analysis
- Frequent revisits (daily to every few days)
- Historical archive for trend analysis

### Vegetation Indices

| Index | Purpose |
|-------|---------|
| NDVI | Primary vegetation health indicator |
| EVI | Enhanced sensitivity for dense pastures |
| NDWI | Water stress and drought detection |

### Processing Pipeline

1. Query satellite imagery for your farm's area
2. Apply cloud masking to remove unusable pixels
3. Compute vegetation indices
4. Aggregate time-series data (rolling means/medians)
5. Calculate zonal statistics per pasture
6. Score pasture readiness using transparent rules
7. Generate recommendation with confidence level

## Getting Started

The web app lives in `app/`. Prerequisites: Node.js 18+ and npm.

```bash
cd app
npm install
npm run dev
```

Common scripts:

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

### Environment Variables

Environment setup is documented in [docs/environment.md](docs/environment.md).

Quick start:

```bash
cp app/.env.example app/.env.local
cp src/ingestion/.env.example src/ingestion/.env.local
```

Set server-side keys (for Convex backend actions) in Convex Dashboard environment variables:

- `ANTHROPIC_API_KEY` (required for AI recommendations)
- `BRAINTRUST_API_KEY` (optional observability)
- `BRAINTRUST_PROJECT_NAME` (optional, defaults to `grazing-agent`)
- `GITHUB_TOKEN` (optional, enables GitHub issue creation from reports)
- `CONVEX_DEBUG` (optional backend debug logging)

## Tech Stack

- **Satellite Access:** pystac-client, odc-stac
- **Raster Processing:** rasterio, xarray, numpy
- **Tile Services:** rio-tiler, TiTiler
- **Geometry:** GeoJSON, PostGIS (optional)
- **Data Source:** Microsoft Planetary Computer (Sentinel-2)

## Project Structure

```
/
├── agents.md              # AI agent reference
├── README.md              # This file
├── app/                   # Web application (Vite + React)
│   ├── public/
│   ├── src/
│   └── ...
├── docs/
│   ├── vision.md          # Thesis and product philosophy
│   ├── architecture.md    # Technical architecture details
│   ├── domain.md          # Remote sensing domain knowledge
│   └── phasing.md         # Development phases
└── ...
```

## Documentation

- [Vision](docs/vision.md) - Thesis and product philosophy
- [Technical Architecture](docs/architecture.md) - System design and data flow
- [Domain Knowledge](docs/domain.md) - Remote sensing and vegetation science primer
- [Development Phasing](docs/phasing.md) - How we build this incrementally
- [Environment Setup](docs/environment.md) - Required and optional variables by runtime

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and contribution guidelines.

## Security

If you discover a vulnerability, see [SECURITY.md](SECURITY.md).

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

