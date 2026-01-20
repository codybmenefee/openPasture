import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const polygonFeature = v.object({
  type: v.literal('Feature'),
  properties: v.optional(v.any()),
  geometry: v.object({
    type: v.literal('Polygon'),
    coordinates: v.array(v.array(v.array(v.number()))),
  }),
})

const paddockStatus = v.union(
  v.literal('ready'),
  v.literal('almost_ready'),
  v.literal('recovering'),
  v.literal('grazed'),
)

export default defineSchema({
  farms: defineTable({
    externalId: v.string(),
    name: v.string(),
    location: v.string(),
    totalArea: v.number(),
    paddockCount: v.number(),
    coordinates: v.array(v.number()),
    geometry: polygonFeature,
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index('by_externalId', ['externalId']),
  paddocks: defineTable({
    farmId: v.id('farms'),
    externalId: v.string(),
    name: v.string(),
    status: paddockStatus,
    ndvi: v.number(),
    restDays: v.number(),
    area: v.number(),
    waterAccess: v.string(),
    lastGrazed: v.string(),
    geometry: polygonFeature,
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index('by_farm', ['farmId'])
    .index('by_farm_externalId', ['farmId', 'externalId']),
})
