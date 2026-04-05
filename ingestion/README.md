# Data Ingestion Pipelines

Each subdirectory contains a pipeline that normalizes external data into
OpenPasture's unified observation model.

## Pipelines

### satellite/ (active)
Python pipeline for satellite imagery processing. Queries STAC catalogs
(Sentinel-2, PlanetScope), applies cloud masking, computes vegetation indices
(NDVI, EVI, NDWI), generates zonal statistics per paddock, and writes
observations to Convex.

### photos/ (planned)
Photo upload and auto-analysis pipeline. Accepts farmer photos, runs vision
model analysis to extract structured perception data (greenness, height,
density, growth stage), and records as `point_visual` observations.

### fieldcam/ (planned)
Fixed field camera integration. Receives images from deployed cameras via
webhook, processes through the photo analysis pipeline, and records as
`point_visual` observations with camera metadata.

### weather/ (planned)
Weather data feed integration. Pulls current conditions and forecasts from
weather APIs, records as `none` GIS capability observations for the agent
to factor into grazing decisions.

## Observation Model

All pipelines produce records in the unified observations table with:
- `sourceType` - what produced the data (sentinel2, photo, fieldcam, etc.)
- `gisCapability` - what the UI can render (spectral_raster, point_visual, none)
- `visualState` - normalized perception data the agent reads for decisions
- `confidence` - how much to trust this observation (0-1)
