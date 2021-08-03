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

const argv = yargs(hideBin(process.argv))
      // .usage('Usage: $0 substrs to choose unit in heap [options]')
      .options({
        'info': {
          describe: 'show unit info'
        },
        'input': {
          alias: 'i',
          describe: 'path to fanki-heap'
        },
      })
      .command('substr... etc', 'lookup in a books heap by substrs', () => {}, (argv) => {
        console.info(argv)
      })
      .demandCommand(1,
                     `you need at least one substr to lookup in a heap (case insensitive)
describe input path to books heap in config file or in input option
config file can be in current-dir/.fankiconf.json or home-dir/.fankiconf.json
more info at http://diglossa.org
`)
      .argv

// log('_ARGV', argv)

start()

async function start() {
  let args = argv._
  // if (!args.length) return // todo: д.б. help
  let conf = checkConfig(argv)
  log('_conf', conf, (conf))
  let heappath
  if (argv.i) heappath = path.resolve(process.cwd(), argv.i)
  else if (conf) heappath = conf.input
  else {
    log(chalk.red('where is your heap?'))
    return
  }
  log('_hp', heappath)
  if (argv.info) {
    log('_INFO', heappath)
  }

  let res = lookupheap(heappath, args)
  if (!res.fn) {
    log(chalk.green('lookup heap:'), chalk.red(res.mess))
    if (res.files) log(res.files)
    return
  }
  log('_HP', heappath)
  if (!conf) conf = {}
  heappath = heappath.replace(/^~/, '')
  conf.heap = res.fn.split(heappath)[0] + heappath
  conf.unit = res.fn
  log('___CONF', conf)
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
      console.log('_ERR no config')
    }
  }
  return conf
}
