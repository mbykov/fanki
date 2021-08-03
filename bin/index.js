#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { lookupheap } from '../../heap.js/index.js'
import { fanki } from '../lib/index.js'
import fse from 'fs-extra'
import os from 'os'
import langs from 'langs'
import chalk from 'chalk'
import path from 'path'
import JSON5 from 'json5'
const log = console.log

const description = chalk.bold('at least one substr to lookup in a heap ') + `(case insensitive)
`
      + chalk.green.bold('\nuse arrows: \n') + ``
      + chalk.bold('left / right - ') + `to move along the card \n`
      + chalk.bold('down - ') + `next card \n`
      + chalk.bold('shift down - ') + `change card color from green to red, (from raw to ripe) \n`
      + chalk.bold('shift left / right - ') + `move along a line to press \'d\', \'s\' or  \'v\' \n`
      + chalk.green.bold('\ncontrols: \n') +
`d - wordform dictionary search
s - symbol search (useful for chinese)
h - help
ctrl+a - jump to beginning of a line
ctrl+l - clear screen
ctrl+k - clear line
v - (not ctrl-v!) - past arbitrary text

more info at http://diglossa.org
`

const argv = yargs(hideBin(process.argv))
      // .usage('Usage: $0 substrs to choose unit in heap [options]')
      .options({
        // 'info': {
        //   describe: 'show unit info'
        // },
        'input': {
          alias: 'i',
          describe: 'path to heap (default in ~/.fankiconf.json or current-dir/.fankiconf.json)'
        },
      })
      .command('substr... etc', 'lookup in a books heap by substrs', () => {}, (argv) => {
        // console.info(argv)
        console.log(chalk.green('kuku'))
      })
      .demandCommand(1, description)
      // .help('h')
      .argv

// log('_ARGV', argv)

start()

async function start() {
  let args = argv._
  let conf = checkConfig(argv)
  let heappath
  if (argv.i) heappath = path.resolve(process.cwd(), argv.i)
  else if (conf) heappath = conf.input
  else {
    log(chalk.red('where is your heap?'))
    return
  }

  let res = lookupheap(heappath, args)
  if (!res.fn) {
    log(chalk.green('lookup heap:'), chalk.red(res.mess))
    if (res.files) log(res.files)
    return
  }
  if (!conf) conf = {}
  heappath = heappath.replace(/^~/, '')
  conf.heap = res.fn.split(heappath)[0] + heappath
  conf.unit = res.fn
  fanki(conf)
}

function checkConfig(argv) {
  const homedir = os.homedir()
  const currentdir = process.cwd()
  const confname = argv.conf || '.fankiconf.json'
  let cpath = path.resolve(currentdir, confname)
  let str, conf = null
  try {
    str = fse.readFileSync(cpath).toString()
    conf = JSON5.parse(str)
  } catch(err) {
    try {
      cpath = path.resolve(homedir, confname)
      str = fse.readFileSync(cpath).toString()
      conf = JSON5.parse(str)
    } catch(err) {
      // console.log('_ERR no config')
    }
  }
  return conf
}
