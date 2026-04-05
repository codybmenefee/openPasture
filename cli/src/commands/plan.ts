import type { Command } from 'commander'
import { getClient } from '../client.js'
import { api } from '../../../app/convex/_generated/api.js'

export function registerPlanCommands(program: Command) {
  const plan = program
    .command('plan')
    .description('Grazing plan management')

  plan
    .command('today')
    .description('Get today\'s grazing plan')
    .option('-f, --farm <id>', 'Farm external ID')
    .action(async (opts: { farm?: string }) => {
      const client = getClient()
      const todayPlan = await client.query(
        api.workflows.intelligence.getTodayPlan,
        { farmExternalId: opts.farm }
      )
      if (todayPlan) {
        console.log(JSON.stringify(todayPlan, null, 2))
      } else {
        console.log('No plan for today. Run `op plan generate` to create one.')
      }
    })

  plan
    .command('generate')
    .description('Generate a new daily plan via the grazing agent')
    .option('-f, --farm <id>', 'Farm external ID')
    .option('-u, --user <id>', 'User ID')
    .action(async (opts: { farm?: string; user?: string }) => {
      const client = getClient()
      console.log('Generating daily plan...')
      const planId = await client.action(
        api.workflows.intelligenceActions.generateDailyPlan,
        {
          farmExternalId: opts.farm,
          userId: opts.user,
        }
      )
      if (planId) {
        console.log(`Plan generated: ${planId}`)
        const plan = await client.query(
          api.workflows.intelligence.getPlanById,
          { planId }
        )
        console.log(JSON.stringify(plan, null, 2))
      } else {
        console.log('No plan generated (may already exist or insufficient data).')
      }
    })

  plan
    .command('approve <planId>')
    .description('Approve a pending plan')
    .option('--feedback <text>', 'Optional feedback with approval')
    .action(async (planId: string, opts: { feedback?: string }) => {
      const client = getClient()
      await client.mutation(
        api.workflows.intelligence.approvePlan,
        {
          planId: planId as any,
          feedback: opts.feedback,
        }
      )
      console.log(`Plan ${planId} approved.`)
    })

  plan
    .command('history')
    .description('List recent plans')
    .option('-f, --farm <id>', 'Farm external ID')
    .option('-n, --limit <count>', 'Number of plans to show', '10')
    .action(async (opts: { farm?: string; limit: string }) => {
      const client = getClient()
      const plans = await client.query(
        api.workflows.intelligence.getPlanHistory,
        {
          farmExternalId: opts.farm,
          limit: parseInt(opts.limit, 10),
        }
      )
      console.log(JSON.stringify(plans, null, 2))
    })
}
