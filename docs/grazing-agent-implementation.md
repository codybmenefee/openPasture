# Grazing Intelligence Agent - Implementation Summary

## Overview
This document describes the implementation of a Convex Agent for generating daily grazing plans with natural language justifications.

## Changes Made

### 1. Agent Component Installation
- Installed `@convex-dev/agent` package
- Configured `convex/convex.config.ts` with the agent component

### 2. Schema Updates (`convex/schema.ts`)
Added two new fields to the `plans` table:
- `sectionJustification`: Natural language explanation (3-5 sentences) from the LLM
- `paddockGrazedPercentage`: Percentage of paddock already grazed

### 3. Agent Tools (`convex/grazingAgentTools.ts`)

#### Queries
1. **getPaddockData**
   - Returns current paddock state including NDVI, rest days, rotation progress
   - Includes latest observation data and geometry

2. **getPreviousSections**
   - Returns previously grazed sections in a specific paddock
   - Includes section geometry, area, date, and justification

3. **getFarmSettings**
   - Returns user preferences (NDVI threshold, rest period)

4. **calculatePaddockGrazedPercentage**
   - Calculates percentage of paddock already grazed based on previous plans

#### Mutations
1. **createPlanWithSection**
   - Creates or updates a plan with section data
   - Stores section geometry, justification, confidence, and reasoning

2. **finalizePlan**
   - Sets plan status to 'pending' for user approval

### 4. Agent Definition (`convex/grazingAgent.ts`)
- Uses Anthropic Haiku 4.5 model via `@ai-sdk/anthropic`
- System prompt defines grazing intelligence specialist role
- 5-step max execution for focused recommendations
- Tools for querying data and creating plans

### 5. Plan Generation (`convex/intelligenceActions.ts`)
- Replaced Python script integration with Convex Agent
- Agent creates thread, analyzes data, and generates plan
- Fallback to default plan if agent fails

### 6. UI Updates
Updated `MorningBrief.tsx`, `BriefCard.tsx`, and `ApprovedState.tsx`:
- Display section justification (3-5 sentences from LLM)
- Show paddock grazed percentage
- Visual distinction for agent recommendations

## Data Flow

```
1. User triggers plan generation
2. Action creates agent thread
3. Agent calls getPaddockData → gets current state
4. Agent calls getPreviousSections → gets grazed geometries
5. Agent analyzes and calls createPlanWithSection
6. Agent calls finalizePlan
7. Plan ready for user approval
```

## Removed Components
- Python script integration (`src/intelligence/`)
- External process execution
- JSON parsing from stdout

## Benefits
- Direct LLM access to Convex data via tools
- Persistent message history (Convex Agent feature)
- Natural language justifications (3-5 sentences)
- Automatic confidence scoring from LLM
- Better debugging via Convex Agent playground

## Environment Variables Required
- `ANTHROPIC_API_KEY`: Anthropic API key (already configured)
