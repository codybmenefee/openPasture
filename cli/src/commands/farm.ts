import type { Command } from 'commander'
import { getClient } from '../client.js'
import { api } from '../../../app/convex/_generated/api.js'

export function registerFarmCommands(program: Command) {
  const farm = program
    .command('farm')
    .description('Farm status and configuration')

  farm
    .command('status')
    .description('Get overall farm status')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const [paddocks, settings] = await Promise.all([
        client.query(
          api.harness.tools.grazingAgentTools.getAllPaddocksWithObservations,
          { farmExternalId: opts.farm }
        ),
        client.query(
          api.harness.tools.grazingAgentTools.getFarmSettings,
          { farmExternalId: opts.farm }
        ),
      ])

      const readyCount = paddocks.filter((p: { status: string }) => p.status === 'ready').length
      const totalCount = paddocks.length
      const avgNdvi = paddocks.reduce((sum: number, p: { ndviMean: number }) => sum + p.ndviMean, 0) / totalCount

      console.log(JSON.stringify({
        paddockCount: totalCount,
        readyToGraze: readyCount,
        averageNDVI: Math.round(avgNdvi * 100) / 100,
        settings,
        paddocks,
      }, null, 2))
    })

  farm
    .command('brief')
    .description('Get today\'s plan for the farm')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const plan = await client.query(
        api.workflows.intelligence.getTodayPlan,
        { farmExternalId: opts.farm }
      )
      if (plan) {
        console.log(JSON.stringify(plan, null, 2))
      } else {
        console.log('No plan generated for today.')
      }
    })

  farm
    .command('settings')
    .description('Get farm settings')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const settings = await client.query(
        api.data.settings.getSettings,
        { farmExternalId: opts.farm }
      )
      console.log(JSON.stringify(settings, null, 2))
    })

  farm
    .command('livestock')
    .description('Get livestock summary')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const livestock = await client.query(
        api.harness.tools.grazingAgentTools.getLivestockContextForAgent,
        { farmExternalId: opts.farm }
      )
      console.log(JSON.stringify(livestock, null, 2))
    })
}
