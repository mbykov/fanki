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

let config = readConf()
log('_CONF', config)

// heapPath = path.resolve(heapPath, 'Greek/lushing-01.md')

let filename = config.heap + '/Greek/lushing-01.md'

// let heapPath_ = resolve(__dirname, config.heap)
const heap = new URL(filename, import.meta.url);
let heapPath = heap.pathname
log('_heapPath', heapPath)

let cards = getCards(heapPath)
log('_CARDS_', cards.length)

const homedir = os.homedir();
log('_HOMEDIR_', homedir)

// =========== HOME
process.env['HOME']

let card = {
  desc() {
    let desc = this.current[this.step]
    if (!desc) {
      this.random()
      desc = this.current[this.step]
    }
    return desc
  },

  show() {
    let desc = this.current[this.step]
    if (!desc) {
      log('_RANDOM-CARD')
      this.random()
    } else {
      log('_DESC:', chalk.green(desc))
    }
  },

  next() {
    this.step += 1
    // this.show()
  },

  prevStep() {
    this.step -= 1
    this.show()
  },

  random() {
    let idx = getRandomInt(cards.length)
    this.current = cards[idx]
    this.step = 0
    // this.show()
  }
}

const input = process.stdin

const rl = readline.createInterface({
  input: input,
  output: process.stdout,
})

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
      console.log('_Shift+Down');
    } else if (key.name == 'down') {
      console.log('_Down');
      card.random()

    } else if (key.name == 'up' && key.shift) {
      let desc = card.desc()
      rl.write(null, { ctrl: true, name: 'u' })
      rl.write(desc)
    } else if (key.name == 'up') {
      card.next()
      let desc = card.desc()
      rl.write(null, { ctrl: true, name: 'u' })
      rl.write(desc)
      // card.random()

    } else if (key.name == 'left') {
      console.log('_Left');
      card.prevStep()
    } else if (key.name == 'right') {
      console.log('_Right');
      card.next()
    }
  }
});

card.random()
console.log('Press any key...');

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getCards(heapPath) {
  try {
    let str = fse.readFileSync(heapPath).toString().trim()
    let rows = str.trim().split('\n')
    let cards = [], card
    let comm = ''
    rows.forEach(row=> {
      if (!row) return
      let tmp = row.slice(0,2)
      if (tmp == '# ') {
        comm = ''
        return
      } else if (tmp == '##') {
        comm = row
      }  else {
        card = row.trim().split(' = ')
        if (comm) card.push(comm)
      }
      cards.push(card)
    })
    return cards
  } catch (err) {
    log('_ERR CARDS')
  }
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
