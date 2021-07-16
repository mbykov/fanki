#!/usr/bin/env node

const log = console.log
import { Command } from 'commander/esm.mjs';
const program = new Command();
import {init} from './lib/index.js'

program
  .option('-d, --debug', 'output extra debugging')

program
  .command('start <substr...>')
  .alias('conv')
  .description('convert e-book from .epub, .fb2, .pdf, .md to .dgl', true)
  .action((substr) => {
    start(substr)
  });

program.parse(process.argv);

function start(substr) {
  init(substr)
}
