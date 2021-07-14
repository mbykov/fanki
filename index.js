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
import { getUnitDocs, saveUnitDocs, getUnitDicts, saveUnitDicts, searchDict } from './lib/pouchdb.js'
import {oxia, comb, plain, strip} from 'orthos'

let qs = process.argv.slice(2)
const homedir = os.homedir();
// log('_HOMEDIR_', homedir)

init()

async function init() {
  let config = readConf()
  config  = lookupHeap(config)
  if (!config.dbn) return
  let unitname = config.dbn
  log('_UNAME', unitname);

  let unitdocs = await getUnitDocs(config.dbn)
  if (!unitdocs.length) {
    let str = getFile(config)
    if (!str) return
    let docs = parseDocs(str)
    await saveUnitDocs(config.dbn, docs)
    unitdocs = docs
  }

  let unitdicts = await getUnitDicts(config.dbn)
  if (!unitdicts.length) {
    log('_SAVE DICT_')
    let dictstr = getDictFile()
    let dicts = parseDicts(dictstr)
    await saveUnitDicts(config.dbn, dicts)
    unitdicts = dicts
  }

  let tmpdicts = unitdicts.slice(10,13)
  log('_DICTS', tmpdicts)

  startFanki(unitname, unitdocs)
}

function startFanki(unitname, cards) {
  log(cards.length, chalk.green('cards found, use arrows to start'))
  const input = process.stdin

  const rl = readline.createInterface({
    input: input,
    output: process.stdout,
  })

  let card = {
    desc() {
      let desc = this.current.descs[this.step]
      if (!desc) {
        this.random()
        desc = this.current.descs[this.step]
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
      let more = (this.current.descs.length -1 > this.step) ? '->' : ''
      desc += more
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      rl.write(desc)
    },

    async dict() {
      let pos = rl.cursor
      let desc = card.desc()
      let wf = getWordAt(desc, pos)
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      // log('_1')
      // log('_2', wf)
      let dict = await searchDict(unitname, wf)
      if (dict && dict.rdict) {
        let answer = [dict.article, dict.trns].join(': ')
        log(chalk.green('dict: '), answer)
      } else {
        log(chalk.red('dict: no result:'), wf)
      }
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      this.show()
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
    // log('_KKYE', key);
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

      // } else if (key.name == 'return') {
        // card.q()
      } else if (key.name == 'd') {
        card.dict()
      } else if (key.name == 'left' && key.shift) {
      } else if (key.name == 'right' && key.shift) {

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
  }
  // log('_C', config)
  return config
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
  return ''
}

function getDictFile() {
  let fpath = '../heap/grc/attic-dict.md'
  const file = new URL(fpath, import.meta.url);
  let filePath = file.pathname
  log('_DP', filePath)
  try {
    return fse.readFileSync(filePath).toString().trim()
  } catch (err) {
    log('_ERR CARDS')
  }
  return ''
}

function parseDocs(str) {
  let rows = str.trim().split('\n')
  let cards = [], card, arr
  let comm = ''
  rows.forEach(row=> {
    card = {}
    if (!row) return
    let tmp = row.slice(0,2)
    if (tmp == '# ') {
      comm = ''
      return
    } else if (tmp == '##') {
      row = row.slice(2)
      comm = row
    }  else {
      card.descs = row.trim().split(' = ')
      if (comm) card.descs.push(comm)
    }
    if (card.descs) cards.push(card)
  })
  return cards
}

function parseDicts(str) {
  let rows = str.trim().split('\n')
  let dicts = [], dict, arr, rdict, article
  rows.forEach(row=> {
    if (!row) return
    dict = {}
    let arr = row.trim().split(' = ')
    article = arr[0].split('(')[0].trim()
    let rdict = article.split(/,| or/)[0]
    dict.rdict = rdict
    dict.dict = comb(rdict)
    // dict.dict = oxia(comb(rdict))
    dict.article = (article == rdict) ? '' : article
    dict.trns = arr.slice(1).join('; ')
    dicts.push(dict)
  })
  return dicts
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

// https://stackoverflow.com/questions/5173316/finding-the-word-at-a-position-in-javascript
function getWordAt (str, pos) {
  str = String(str);
  pos = Number(pos) >>> 0;

  // Search for the word's beginning and end.
  var left = str.slice(0, pos + 1).search(/\S+$/),
  // var left = str.slice(0, pos + 1).search(/\S+\s*/),
      right = str.slice(pos).search(/\s/);

  // The last word in the string is a special case.
  if (right < 0) {
    return str.slice(left);
  }

  return str.slice(left, right + pos);
}
