import type { Command } from 'commander'
import { getClient } from '../client.js'
import { api } from '../../../app/convex/_generated/api.js'

export function registerPaddockCommands(program: Command) {
  const paddock = program
    .command('paddock')
    .description('Paddock state and history')

  paddock
    .command('list')
    .description('List all paddocks with current state')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const paddocks = await client.query(
        api.harness.tools.grazingAgentTools.getAllPaddocksWithObservations,
        { farmExternalId: opts.farm }
      )
      console.log(JSON.stringify(paddocks, null, 2))
    })

  paddock
    .command('state')
    .description('Get detailed state for the active paddock')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const data = await client.query(
        api.harness.tools.grazingAgentTools.getPaddockData,
        { farmExternalId: opts.farm }
      )
      console.log(JSON.stringify(data, null, 2))
    })

  paddock
    .command('context <paddockId>')
    .description('Get paddock context for agent decision-making')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (paddockId: string, opts: { farm?: string }) => {
      const client = getClient()
      const context = await client.query(
        api.harness.tools.grazingAgentTools.getPaddockContextForAgent,
        {
          farmExternalId: opts.farm,
          paddockExternalId: paddockId,
        }
      )
      console.log(JSON.stringify(context, null, 2))
    })

  paddock
    .command('history <paddockId>')
    .description('Get observation history for a paddock')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (paddockId: string, opts: { farm?: string }) => {
      const client = getClient()
      const observations = await client.query(
        api.data.observations.getObservations,
        {
          farmExternalId: opts.farm ?? undefined,
          paddockExternalId: paddockId,
        }
      )
      console.log(JSON.stringify(observations, null, 2))
    })
}
