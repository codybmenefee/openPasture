import type { Command } from 'commander'
import { getClient } from '../client.js'
import { api } from '../../../app/convex/_generated/api.js'

export function registerObserveCommands(program: Command) {
  const observe = program
    .command('observe')
    .description('Record observations on the farm')

  observe
    .command('add-note')
    .description('Add a text observation about a paddock or the farm')
    .requiredOption('-f, --farm <id>', 'Farm internal ID')
    .requiredOption('-t, --target <id>', 'Target paddock or farm ID')
    .requiredOption('-c, --content <text>', 'Observation content')
    .option('-l, --level <level>', 'Observation level: farm, paddock, or zone', 'paddock')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--author <name>', 'Author ID')
    .action(async (opts: {
      farm: string
      target: string
      content: string
      level: string
      tags?: string
      author?: string
    }) => {
      const client = getClient()
      await client.mutation(
        api.data.farmerObservations.create,
        {
          farmId: opts.farm as any,
          authorId: opts.author ?? 'cli',
          level: opts.level as 'farm' | 'paddock' | 'zone',
          targetId: opts.target,
          content: opts.content,
          tags: opts.tags ? opts.tags.split(',').map(t => t.trim()) : undefined,
        }
      )
      console.log('Observation recorded.')
    })

  observe
    .command('list')
    .description('List recent observations for a farm')
    .requiredOption('-f, --farm <id>', 'Farm internal ID')
    .option('-n, --limit <count>', 'Number of observations', '20')
    .action(async (opts: { farm: string; limit: string }) => {
      const client = getClient()
      const observations = await client.query(
        api.data.farmerObservations.listRecent,
        {
          farmId: opts.farm as any,
          limit: parseInt(opts.limit, 10),
        }
      )
      console.log(JSON.stringify(observations, null, 2))
    })

  observe
    .command('satellite')
    .description('List satellite observations for a farm')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const observations = await client.query(
        api.data.observations.getObservations,
        { farmExternalId: opts.farm }
      )
      console.log(JSON.stringify(observations, null, 2))
    })
}
