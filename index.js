const log = console.log
import { LowSync, JSONFileSync } from 'lowdb'
import fse from 'fs-extra'
import JSON5 from 'json5'
// import {fileURLToPath} from 'node:url';
// import {resolve} from 'path'
import os from 'os'
// const readline = require('readline');
import readline from 'readline'
import chalk from 'chalk'
import glob from 'glob'
import { dbInfo } from './lib/pouchdb.js'

let qs = process.argv.slice(2)
const homedir = os.homedir();
// log('_HOMEDIR_', homedir)

init()

async function init() {
  let config = readConf()
  config  = lookupHeap(config)
  log('_C', config)
  if (!config.dbn) return
  let info = await dbInfo(config)
  log('_INFO', info.doc_count);
  let docs
  if (!info.doc_count) {
    let str = getFile(config)
    if (!str) return
    docs = makeDocs(str)
    log('_DOCS', docs);
  }

  // allDocs()
}

function lookupHeap(config) {
  let srcdir = config.heap
  let resrc = new RegExp('^' + srcdir + '/')
  let pattern = [srcdir, '**/*'].join('/')

  let fns = glob.sync(pattern)
  config.fns = fns.length
  let restricted = fns.map(fn=> fn.replace(resrc, ''))
  qs.forEach(query=> {
    let req = new RegExp(query, 'i')
    restricted = restricted.filter(fn=> req.test(fn))
    })

  if (restricted.length > 1) {
    log(chalk.red('_found too many possible files'))
    log(restricted)
  }
  else if (restricted.length == 0) log(chalk.red('_no possible file found'))
  else if (restricted.length == 1) {
    config.dbn = restricted[0]
    // allDBs(config)
    // startFanki(config)
  }
  return config
}

function startFanki(config) {
  // allDBs(config)
  return

  let fpath = config.restricted[0]
  fpath = '../heap/' + fpath
  const file = new URL(fpath, import.meta.url);
  let filePath = file.pathname
  let cards = getCards(fpath)

  log(cards.length, chalk.green('cards found, use arrows to start'))

  const input = process.stdin

  const rl = readline.createInterface({
    input: input,
    output: process.stdout,
  })

  let card = {
    desc() {
      let desc = this.current[this.step]
      if (!desc) {
        this.random()
        desc = this.current[this.step]
      }
      return desc
    },

    next() {
      this.step += 1
    },

    prev() {
      rl.write(null, { ctrl: true, name: 'u' })
      this.step -= 1
    },

    show() {
      let desc = card.desc()
      let more = (this.current.length -1 > this.step) ? ` ${chalk.grey('->')} ` : ''
      desc += more
      rl.write(null, { ctrl: true, name: 'u' })
      rl.write(desc)
    },

    random() {
      rl.setPrompt(chalk.green(' • '))
      let idx = getRandomInt(cards.length)
      this.current = cards[idx]
      this.step = 0
    }
  }

  rl.prompt()
  rl.setPrompt(chalk.green(' • '))
  input.setEncoding('utf8')

  readline.emitKeypressEvents(input);
  input.setRawMode(true);
  input.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else {
      if (key.name == 'down' && key.shift) {
        rl.setPrompt(chalk.red(' • '))
        card.show()
      } else if (key.name == 'down') {
        card.random()
        card.show()

      } else if (key.name == 'up' && key.shift) {
        rl.setPrompt(chalk.green(' • '))
        card.show()
        // } else if (key.name == 'up') {
        //   card.next()
        //   let desc = card.desc()
        //   rl.write(null, { ctrl: true, name: 'u' })
        //   rl.write(desc)
        //   // card.random()

      } else if (key.name == 'left') {
        rl.write(null, { ctrl: true, name: 'k' })
        card.prev()
        card.show()
      } else if (key.name == 'right') {
        card.next()
        card.show()
      } else if (key.name == 'h') {
        let help = `${chalk.bold('use arrows')}:
${chalk.bold('down')}: new card
${chalk.bold('right')}: next desc on the same card (if -> sign), or new card
${chalk.bold('left')} - back along the card
${chalk.bold('colors')} - from green to red (from raw to ripe)
${chalk.bold('shift down')} - down to ripe, so do not show
${chalk.bold('shift up')} - up to raw
${chalk.bold('ctrl+l')} - clear screen
${chalk.bold('ctrl+k')} - clear line
`
        rl.write(null, { ctrl: true, name: 'u' })
        rl.write(null, { ctrl: true, name: 'k' })
        rl.write(help)
      }
    }
  });

  card.random()
  console.log('Press any key...');

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getFile(config) {
  let fpath = config.dbn
  fpath = '../heap/' + fpath
  const file = new URL(fpath, import.meta.url);
  let filePath = file.pathname
  try {
    return fse.readFileSync(filePath).toString().trim()
  } catch (err) {
    log('_ERR CARDS')
  }
}

function makeDocs(str) {
  let rows = str.trim().split('\n')
  log('R', rows.length)
  let cards = [], card, arr
  let comm = ''
  rows.forEach(row=> {
    card = {}
    if (!row) return
    let tmp = row.slice(0,2)
    row = row.slice(2)
    if (tmp == '# ') {
      comm = ''
      return
    } else if (tmp == '##') {
      comm = row
    }  else {
      card.descs = row.trim().split(' = ')
      if (comm) card.descs.push(comm)
    }
    if (card.descs) cards.push(card)
  })
  return cards
}

function readConf() {
  try {
    let str = fse.readFileSync('./config.json').toString()
    let conf = JSON5.parse(str)
    return conf
  } catch (err) {
    log('_ERR CONF')
  }
}
