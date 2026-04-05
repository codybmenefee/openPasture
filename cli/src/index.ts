#!/usr/bin/env node
import { Command } from 'commander'
import { registerPaddockCommands } from './commands/paddock.js'
import { registerFarmCommands } from './commands/farm.js'
import { registerPlanCommands } from './commands/plan.js'
import { registerObserveCommands } from './commands/observe.js'

const program = new Command()

program
  .name('op')
  .description('OpenPasture CLI - tool primitives for agents and developers')
  .version('0.1.0')

registerPaddockCommands(program)
registerFarmCommands(program)
registerPlanCommands(program)
registerObserveCommands(program)

program.parse()
