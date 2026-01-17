# UI Components Documentation

This document catalogs all UI components in the Grazing Intelligence application, including both implemented components and ASCII mockups for screens yet to be built.

---

## Table of Contents

1. [Implemented Components](#implemented-components)
   - [Layout Components](#layout-components)
   - [Brief Components](#brief-components)
   - [Map Components](#map-components)
   - [UI Primitives (shadcn)](#ui-primitives-shadcn)
2. [Routes](#routes)
3. [Screens Yet to Build](#screens-yet-to-build)
   - [Settings Screen](#settings-screen)
   - [History View](#history-view)
   - [Paddock Detail View](#paddock-detail-view)
   - [Analytics Dashboard](#analytics-dashboard)
   - [Onboarding Flow](#onboarding-flow)
   - [Error States](#error-states)
   - [Loading States](#loading-states)

---

## Implemented Components

### Layout Components

Located in `src/components/layout/`

#### `Sidebar.tsx`
Collapsible navigation sidebar with farm branding and navigation links.

```
+-----------------------+
|  [=] Clearview Farm   |
+-----------------------+
|                       |
|  [ ] Dashboard        |
|  [ ] Map              |
|  [ ] Paddocks         |
|  [ ] History          |
|  [ ] Settings         |
|                       |
+-----------------------+
|  [sun/moon] Theme     |
+-----------------------+
```

**Props:** None (uses internal state for collapse)

**Features:**
- Collapsible with hamburger toggle
- Active route highlighting
- Theme toggle integration
- Disabled items show "coming soon" tooltip

---

#### `Header.tsx`
Top navigation bar with search and user avatar.

```
+----------------------------------------------------------+
|  Morning Brief for Friday, January 16         [?] [@]    |
+----------------------------------------------------------+
```

**Props:** None

---

#### `ThemeToggle.tsx`
Dropdown button for switching between light/dark/system themes.

**Props:** None (uses ThemeProvider context)

---

### Brief Components

Located in `src/components/brief/`

#### `MorningBrief.tsx`
Main orchestrator component for the daily brief screen.

```
+------------------------------------------+----------------+
|                                          |                |
|  MORNING BRIEF                           | FARM OVERVIEW  |
|  +---------------------------------+     | - Clearview    |
|  | BriefCard                       |     | - 450 ha       |
|  | - Recommendation                |     | - 8 paddocks   |
|  | - PaddockMiniMap               |     +----------------+
|  | - Confidence                    |     |                |
|  | - Reasoning                     |     | DATA STATUS    |
|  | - [Approve] [Modify]           |     | - Sentinel-2   |
|  +---------------------------------+     | - Last pass    |
|                                          |                |
|  ALTERNATIVES                            |                |
|  +----------+ +----------+ +----------+ |                |
|  | Alt 1    | | Alt 2    | | Alt 3    | |                |
|  | MiniMap  | | MiniMap  | | MiniMap  | |                |
|  +----------+ +----------+ +----------+ |                |
|                                          |                |
+------------------------------------------+----------------+
```

**Props:** None (fetches data from mock files)

**State:**
- `planStatus`: 'pending' | 'approved' | 'modified'
- `approvedAt`: string | null
- `isFeedbackModalOpen`: boolean

---

#### `BriefCard.tsx`
Primary recommendation card with visual movement indicator.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `currentPaddockId` | string | Where livestock currently are |
| `paddock` | Paddock | Target paddock object |
| `confidence` | number | 0-100 confidence score |
| `reasoning` | string[] | List of reasons for recommendation |
| `onApprove` | () => void | Approve button handler |
| `onModify` | () => void | Modify button handler |

---

#### `PaddockMiniMap.tsx`
Compact SVG visualization of farm layout with movement indicators.

```
+---------------------------+
|  [p1] [p2] [p3] [p4]     |
|                           |
|  [p5]--->[p6] [p7] [p8]  |
|   ^                       |
|   Now        Move         |
+---------------------------+
|  [*] Now  [*] Move        |
+---------------------------+
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPaddockId` | string | - | Paddock where livestock are now |
| `targetPaddockId` | string | - | Recommended destination paddock |
| `highlightedPaddockId` | string | - | Optional hover/selected highlight |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Component size variant |
| `showLabels` | boolean | false | Show paddock name labels |
| `className` | string | - | Additional CSS classes |

**Features:**
- Auto-calculates bounding box from GeoJSON
- Color-coded paddocks by status (ready/almost_ready/recovering/grazed)
- Animated pulsing dot on target paddock
- SVG arrow showing movement direction
- Legend with "Now" and "Move" indicators
- Dark/light mode aware colors

---

#### `ConfidenceBar.tsx`
Visual confidence score indicator.

```
Confidence: 87%
[==================  ] 87%
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `value` | number | 0-100 confidence percentage |

---

#### `AlternativeCard.tsx`
Compact card for alternative paddock recommendations.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `currentPaddockId` | string | Current livestock location |
| `paddock` | Paddock | Alternative paddock object |
| `confidence` | number | 0-100 confidence score |

---

#### `FarmOverview.tsx`
Sidebar card displaying farm metadata and paddock status summary.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `farm` | Farm | Farm object with name, location, area |
| `paddocks` | Paddock[] | Array of paddocks for status counts |

---

#### `DataStatusCard.tsx`
Sidebar card showing satellite data status.

**Props:** None (uses hardcoded mock data currently)

---

#### `ApprovedState.tsx`
Full-screen state shown after plan approval with execution instructions.

```
+--------------------------------------------------+
|  [check] Plan Approved at 7:32 AM               |
+--------------------------------------------------+
|                                                  |
|  +-----------------------+  +------------------+ |
|  | TARGET PADDOCK        |  | MOVEMENT MAP     | |
|  | East Ridge            |  | [PaddockMiniMap] | |
|  | - 52 hectares         |  |                  | |
|  | - NDVI: 0.58          |  |                  | |
|  | - Ready to graze      |  |                  | |
|  +-----------------------+  +------------------+ |
|                                                  |
|  +-----------------------+  +------------------+ |
|  | MANUAL FENCING        |  | VIRTUAL FENCING  | |
|  | 1. Open Gate 4        |  | [Copy Coords]    | |
|  | 2. Close Gate 2       |  | [Download GeoJSON]|
|  +-----------------------+  +------------------+ |
|                                                  |
+--------------------------------------------------+
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `paddock` | Paddock | Approved target paddock |
| `currentPaddockId` | string | Current livestock location |
| `approvedAt` | string | ISO timestamp of approval |
| `confidence` | number | Plan confidence score |
| `wasModified` | boolean | Whether plan was modified before approval |

---

#### `FeedbackModal.tsx`
Modal dialog for capturing feedback when modifying a plan.

```
+------------------------------------------+
|  Modify Today's Plan                [X]  |
+------------------------------------------+
|                                          |
|  What's the issue?                       |
|  [Weather] [Ground] [Livestock] [Other]  |
|                                          |
|  Alternative Paddocks:                   |
|  +----------+ +----------+ +----------+  |
|  | Option 1 | | Option 2 | | Option 3 |  |
|  +----------+ +----------+ +----------+  |
|                                          |
|  Additional context:                     |
|  +------------------------------------+  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  [Cancel]                   [Confirm]    |
+------------------------------------------+
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `open` | boolean | Modal visibility state |
| `onClose` | () => void | Close handler |
| `onConfirm` | (feedback: FeedbackData) => void | Submit handler |
| `alternatives` | PlanAlternative[] | Alternative paddock options |

---

### Map Components

Located in `src/components/map/`

#### `MapView.tsx`
Main map screen orchestrator.

```
+----------------------------------------------------------+
|  [Satellite] [NDVI Heat] [Paddocks] [Labels]             |
+----------------------------------------------------------+
|                                                          |
|                    +------------------+                  |
|                    |                  |                  |
|     [ Map with     |   PaddockPanel   |                  |
|       paddock      |   (when clicked) |                  |
|       polygons ]   |                  |                  |
|                    +------------------+                  |
|                                                          |
+----------------------------------------------------------+
```

**Props:** None

**State:**
- `selectedPaddockId`: string | null
- `mapStyle`: 'satellite' | 'ndvi' | 'paddocks' | 'labels'

---

#### `FarmMap.tsx`
MapLibre GL JS wrapper component.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `paddocks` | Paddock[] | Paddock polygons to render |
| `selectedPaddockId` | string \| null | Currently selected paddock |
| `onPaddockClick` | (id: string) => void | Paddock click handler |
| `mapStyle` | string | Current map style mode |

---

#### `PaddockPanel.tsx`
Slide-in panel for paddock details.

```
+------------------+
| [X] East Ridge   |
+------------------+
| Status: Ready    |
| Area: 52 ha      |
| NDVI: 0.58       |
| Rest: 28 days    |
+------------------+
| [View History]   |
+------------------+
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `paddock` | Paddock \| null | Selected paddock to display |
| `onClose` | () => void | Close panel handler |

---

#### `LayerToggles.tsx`
Map layer visibility controls.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `activeLayer` | string | Currently active layer |
| `onLayerChange` | (layer: string) => void | Layer change handler |

---

### UI Primitives (shadcn)

Located in `src/components/ui/`

These are standard shadcn/ui components:

| Component | Description |
|-----------|-------------|
| `badge.tsx` | Status badges (Ready, Recovering, etc.) |
| `button.tsx` | Primary, secondary, ghost button variants |
| `card.tsx` | Card container with header, content, footer |
| `dialog.tsx` | Modal dialog with overlay |
| `separator.tsx` | Horizontal/vertical dividers |
| `tooltip.tsx` | Hover tooltips for disabled items |

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `MorningBrief` | Daily brief dashboard (home) |
| `/map` | `MapView` | Full map view with paddock interaction |

---

## Screens Yet to Build

### Settings Screen

**Route:** `/settings`

```
+----------------------------------------------------------+
|  Settings                                                 |
+----------------------------------------------------------+
|                                                          |
|  FARM CONFIGURATION                                      |
|  +------------------------------------------------------+|
|  | Farm Name        [ Clearview Farm           ]        ||
|  | Location         [ Canterbury, NZ           ]        ||
|  | Total Area       [ 450 ] ha                          ||
|  +------------------------------------------------------+|
|                                                          |
|  GRAZING THRESHOLDS                                      |
|  +------------------------------------------------------+|
|  | Min NDVI for grazing    [===|====] 0.40              ||
|  | Min rest period         [====|===] 21 days           ||
|  | Cloud cover tolerance   [======|=] 50%               ||
|  +------------------------------------------------------+|
|                                                          |
|  NOTIFICATIONS                                           |
|  +------------------------------------------------------+|
|  | Daily brief time        [ 6:00 AM v ]                ||
|  | Email notifications     [x] On                       ||
|  | Push notifications      [ ] Off                      ||
|  +------------------------------------------------------+|
|                                                          |
|  INTEGRATIONS                                            |
|  +------------------------------------------------------+|
|  | Virtual Fence Provider  [ Halter v ]                 ||
|  | API Key                 [ ******** ] [Edit]          ||
|  +------------------------------------------------------+|
|                                                          |
|  DATA MANAGEMENT                                         |
|  +------------------------------------------------------+|
|  | [Export Farm Data]  [Import Paddocks]  [Reset]       ||
|  +------------------------------------------------------+|
|                                                          |
|                              [Cancel]  [Save Changes]    |
+----------------------------------------------------------+
```

**Components needed:**
- `SettingsForm` - Main settings container
- `ThresholdSlider` - Custom slider with labels
- `IntegrationCard` - API key management
- Form inputs: text, select, toggle, slider

---

### History View

**Route:** `/history`

```
+----------------------------------------------------------+
|  History                           [This Week v] [Filter]|
+----------------------------------------------------------+
|                                                          |
|  TIMELINE                                                |
|  +------------------------------------------------------+|
|  | Jan 16  [*]------------------------------------>     ||
|  |         East Ridge - Approved - 87% confidence       ||
|  |         "Optimal NDVI, 28 days rest"                 ||
|  |                                                      ||
|  | Jan 15  [*]------------------------------------>     ||
|  |         North Flats - Approved - 82% confidence      ||
|  |         "Good recovery, moderate biomass"            ||
|  |                                                      ||
|  | Jan 14  [*]-------[Modified]--------------->         ||
|  |         Creek Bend -> South Valley                   ||
|  |         "User: ground too wet"                       ||
|  |                                                      ||
|  | Jan 13  [*]------------------------------------>     ||
|  |         West Slope - Approved - 91% confidence       ||
|  +------------------------------------------------------+|
|                                                          |
|  PADDOCK PERFORMANCE                                     |
|  +------------------------------------------------------+|
|  | Paddock      | Uses | Avg Rest | Avg NDVI | Trend   ||
|  |--------------|------|----------|----------|---------|
|  | East Ridge   |  4   | 26 days  |   0.52   |   ^     ||
|  | North Flats  |  5   | 21 days  |   0.48   |   -     ||
|  | Creek Bend   |  3   | 24 days  |   0.44   |   v     ||
|  | South Valley |  4   | 23 days  |   0.51   |   ^     ||
|  +------------------------------------------------------+|
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `HistoryTimeline` - Vertical timeline of grazing events
- `HistoryEventCard` - Individual event with status
- `PerformanceTable` - Paddock statistics table
- `DateRangeSelector` - Period filter dropdown
- `TrendIndicator` - Up/down/stable arrow icons

---

### Paddock Detail View

**Route:** `/paddocks/:id`

```
+----------------------------------------------------------+
|  [<] East Ridge                              [Edit Name] |
+----------------------------------------------------------+
|                                                          |
|  +---------------------------+  +----------------------+ |
|  |                           |  | STATUS               | |
|  |   [ Paddock Map View ]    |  | Ready to graze       | |
|  |   with boundaries         |  |                      | |
|  |   highlighted             |  | Area: 52 ha          | |
|  |                           |  | Perimeter: 3.2 km    | |
|  +---------------------------+  +----------------------+ |
|                                                          |
|  VEGETATION HEALTH                                       |
|  +------------------------------------------------------+|
|  |     NDVI Over Time (21 days)                         ||
|  |  0.6 |        ___/^^^                                ||
|  |  0.5 |    ___/                                       ||
|  |  0.4 |___/                                           ||
|  |  0.3 |                                               ||
|  |      +-----|-----|-----|-----|-----|-----|-----|     ||
|  |           -21   -18   -14   -10    -7    -3   Today  ||
|  +------------------------------------------------------+|
|                                                          |
|  GRAZING HISTORY                                         |
|  +------------------------------------------------------+|
|  | Date       | Duration | Entry NDVI | Exit NDVI      ||
|  |------------|----------|------------|-----------------|
|  | Dec 19     | 3 days   | 0.58       | 0.32           ||
|  | Nov 24     | 4 days   | 0.55       | 0.28           ||
|  | Oct 30     | 3 days   | 0.52       | 0.30           ||
|  +------------------------------------------------------+|
|                                                          |
|  CURRENT OBSERVATIONS                                    |
|  +------------------------------------------------------+|
|  | Metric    | Value  | Status    | Trend              ||
|  |-----------|--------|-----------|---------------------|
|  | NDVI      | 0.58   | Optimal   | +0.04/week         ||
|  | EVI       | 0.42   | Good      | +0.02/week         ||
|  | NDWI      | -0.12  | Normal    | stable             ||
|  | Cloud %   | 15%    | Clear     | -                  ||
|  +------------------------------------------------------+|
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `PaddockHeader` - Name, edit, back navigation
- `PaddockMapDetail` - Larger map view with single paddock
- `NDVIChart` - Time series line chart (use Recharts)
- `GrazingHistoryTable` - Past grazing events
- `ObservationTable` - Current satellite metrics
- `StatusBadge` - Colored status indicators

---

### Analytics Dashboard

**Route:** `/analytics`

```
+----------------------------------------------------------+
|  Analytics                      [Last 30 Days v] [Export]|
+----------------------------------------------------------+
|                                                          |
|  KEY METRICS                                             |
|  +------------+ +------------+ +------------+ +--------+ |
|  | Grazing    | | Avg Rest   | | Utilization| | Health | |
|  | Events     | | Period     | | Rate       | | Score  | |
|  |    12      | |  24 days   | |    78%     | |   B+   | |
|  | +15% MoM   | | -2 days    | | +5%        | | stable | |
|  +------------+ +------------+ +------------+ +--------+ |
|                                                          |
|  PADDOCK ROTATION HEATMAP                                |
|  +------------------------------------------------------+|
|  |          | Wk1 | Wk2 | Wk3 | Wk4 | Wk5 | Wk6 |       ||
|  |----------|-----|-----|-----|-----|-----|-----|       ||
|  | East     | ### |     |     | ### |     |     |       ||
|  | North    |     | ### |     |     | ### |     |       ||
|  | Creek    |     |     | ### |     |     | ### |       ||
|  | South    | ### |     |     | ### |     |     |       ||
|  | West     |     | ### |     |     | ### |     |       ||
|  +------------------------------------------------------+|
|                                                          |
|  FARM-WIDE NDVI TREND                                    |
|  +------------------------------------------------------+|
|  |  0.6 |                          ____                 ||
|  |  0.5 |              ____-------                      ||
|  |  0.4 |    _____----                                  ||
|  |  0.3 |----                                           ||
|  |      +-----|-----|-----|-----|-----|                 ||
|  |           Oct   Nov   Dec   Jan   Feb                ||
|  +------------------------------------------------------+|
|                                                          |
|  RECOMMENDATIONS ACCURACY                                |
|  +------------------------------------------------------+|
|  | Approved as-is:     85%  [=================   ]      ||
|  | Modified:           12%  [==                  ]      ||
|  | Rejected:            3%  [                    ]      ||
|  +------------------------------------------------------+|
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `MetricCard` - KPI card with value and trend
- `RotationHeatmap` - Grid showing paddock usage over time
- `FarmNDVIChart` - Farm-wide vegetation trend
- `AccuracyChart` - Horizontal bar chart for recommendation stats
- `DateRangeSelector` - Period filter

---

### Onboarding Flow

**Route:** `/onboarding` (or modal sequence)

```
STEP 1: Welcome
+----------------------------------------------------------+
|                                                          |
|                    [LOGO]                                |
|                                                          |
|           Welcome to Grazing Intelligence                |
|                                                          |
|     Daily decisions for adaptive grazing, powered        |
|     by satellite sensing and your local knowledge.       |
|                                                          |
|                    [Get Started]                         |
|                                                          |
+----------------------------------------------------------+

STEP 2: Farm Setup
+----------------------------------------------------------+
|                                                          |
|  Tell us about your farm                    Step 2 of 4  |
|  --------------------------------------------------------|
|                                                          |
|  Farm Name                                               |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                          |
|  Location                                                |
|  +----------------------------------------------------+  |
|  | [ Search or drop pin on map ]                      |  |
|  +----------------------------------------------------+  |
|                                                          |
|  Total Area (approximate)                                |
|  +----------------------------------------------------+  |
|  |                                       | hectares   |  |
|  +----------------------------------------------------+  |
|                                                          |
|                              [Back]  [Continue]          |
+----------------------------------------------------------+

STEP 3: Draw Paddocks
+----------------------------------------------------------+
|                                                          |
|  Define your paddocks                       Step 3 of 4  |
|  --------------------------------------------------------|
|                                                          |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |     [ Map with drawing tools ]                     |  |
|  |                                                    |  |
|  |     Draw polygons to define paddock boundaries.    |  |
|  |     Click to add points, double-click to finish.   |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                          |
|  PADDOCKS DEFINED: 3                                     |
|  +------------------+ +------------------+ +----------+  |
|  | Paddock 1        | | Paddock 2        | | + Add    |  |
|  | 45 ha            | | 52 ha            | |          |  |
|  +------------------+ +------------------+ +----------+  |
|                                                          |
|  Or: [Import from GeoJSON] [Auto-detect boundaries]      |
|                                                          |
|                              [Back]  [Continue]          |
+----------------------------------------------------------+

STEP 4: Confirmation
+----------------------------------------------------------+
|                                                          |
|  You're all set!                            Step 4 of 4  |
|  --------------------------------------------------------|
|                                                          |
|  +----------------------------------------------------+  |
|  | Farm: Clearview Farm                               |  |
|  | Location: Canterbury, NZ                           |  |
|  | Area: 450 hectares                                 |  |
|  | Paddocks: 8 defined                                |  |
|  +----------------------------------------------------+  |
|                                                          |
|  We'll start analyzing satellite imagery for your        |
|  farm. Your first Morning Brief will be ready by         |
|  tomorrow at 6:00 AM.                                    |
|                                                          |
|                    [Go to Dashboard]                     |
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `OnboardingStep` - Step container with progress indicator
- `FarmSetupForm` - Basic farm info inputs
- `PaddockDrawingTool` - Map with polygon drawing
- `PaddockList` - List of drawn paddocks
- `OnboardingComplete` - Summary and CTA

---

### Error States

```
NO DATA AVAILABLE
+----------------------------------------------------------+
|                                                          |
|  MORNING BRIEF - January 16, 2025                        |
|  --------------------------------------------------------|
|                                                          |
|           [cloud icon]                                   |
|                                                          |
|           Unable to Generate Brief                       |
|                                                          |
|     Recent satellite passes were obscured by cloud       |
|     cover. We need at least 50% clear imagery to         |
|     make confident recommendations.                      |
|                                                          |
|     Last successful observation: January 14, 2025        |
|     Next satellite pass: January 17, 2025 (estimated)    |
|                                                          |
|     [View Last Brief]   [Use Manual Override]            |
|                                                          |
+----------------------------------------------------------+

LOW CONFIDENCE WARNING
+----------------------------------------------------------+
|                                                          |
|  [!] Limited Data Available                              |
|  --------------------------------------------------------|
|                                                          |
|  Today's recommendation is based on partial data:        |
|                                                          |
|  - Cloud cover: 65% (threshold: 50%)                     |
|  - Last clear image: 5 days ago                          |
|  - Confidence: 52%                                       |
|                                                          |
|  Recommendation may be less reliable than usual.         |
|  Consider local conditions before approving.             |
|                                                          |
|     [Proceed Anyway]   [Wait for Better Data]            |
|                                                          |
+----------------------------------------------------------+

CONNECTION ERROR
+----------------------------------------------------------+
|                                                          |
|           [wifi-off icon]                                |
|                                                          |
|           Connection Lost                                |
|                                                          |
|     Unable to reach the server. Your last synced         |
|     data is from January 15, 2025 at 6:00 AM.            |
|                                                          |
|     [Retry]   [Work Offline]                             |
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `ErrorState` - Generic error container
- `NoDataError` - Cloud cover specific error
- `LowConfidenceWarning` - Partial data warning
- `ConnectionError` - Network error state

---

### Loading States

```
BRIEF LOADING
+----------------------------------------------------------+
|                                                          |
|  MORNING BRIEF                                           |
|  --------------------------------------------------------|
|                                                          |
|  +----------------------------------------------------+  |
|  | [shimmer]                                          |  |
|  | [shimmer]                     [shimmer]            |  |
|  | [shimmer]                                          |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +------------+  +------------+  +------------+          |
|  | [shimmer]  |  | [shimmer]  |  | [shimmer]  |          |
|  | [shimmer]  |  | [shimmer]  |  | [shimmer]  |          |
|  +------------+  +------------+  +------------+          |
|                                                          |
+----------------------------------------------------------+

INITIAL DATA FETCH
+----------------------------------------------------------+
|                                                          |
|           [spinner]                                      |
|                                                          |
|           Analyzing your paddocks...                     |
|                                                          |
|     Fetching latest satellite imagery                    |
|     Computing vegetation indices                         |
|     Generating recommendations                           |
|                                                          |
|     This usually takes 10-15 seconds.                    |
|                                                          |
+----------------------------------------------------------+
```

**Components needed:**
- `BriefSkeleton` - Shimmer loading for brief
- `CardSkeleton` - Generic card loading state
- `LoadingSpinner` - Centered spinner with message
- `ProgressLoader` - Multi-step loading indicator

---

## Mock Data Files

Located in `src/data/mock/`

| File | Exports | Description |
|------|---------|-------------|
| `farm.ts` | `mockFarm` | Farm metadata |
| `paddocks.ts` | `paddocks`, `getPaddockById()` | Paddock array with GeoJSON |
| `plan.ts` | `todaysPlan` | Current day's grazing plan |
| `observations.ts` | `observations` | Historical NDVI observations |

---

## Type Definitions

Located in `src/lib/types.ts`

```typescript
interface Farm {
  id: string
  name: string
  location: string
  totalArea: number
  paddockCount: number
}

interface Paddock {
  id: string
  name: string
  status: 'ready' | 'almost_ready' | 'recovering' | 'grazed'
  ndvi: number
  restDays: number
  area: number
  geometry: GeoJSON.Feature
}

interface Plan {
  id: string
  date: string
  currentPaddockId: string
  recommendedPaddockId: string
  confidence: number
  reasoning: string[]
  alternatives: PlanAlternative[]
  status: PlanStatus
  approvedAt?: string
  briefNarrative: string
}

type PlanStatus = 'pending' | 'approved' | 'modified'

interface PlanAlternative {
  paddockId: string
  confidence: number
}
```

---

## Next Steps

Priority order for building remaining screens:

1. **Loading States** - Essential for production feel
2. **Error States** - Handle edge cases gracefully
3. **Paddock Detail View** - Deeper dive into individual paddocks
4. **History View** - Track decisions over time
5. **Settings Screen** - User customization
6. **Analytics Dashboard** - Farm performance insights
7. **Onboarding Flow** - New user experience

Each screen should follow the established patterns:
- Use shadcn/ui primitives where possible
- Custom SVG for specialized visualizations (like PaddockMiniMap)
- Dark/light mode support via CSS variables
- Mock data in separate files for easy Convex integration
