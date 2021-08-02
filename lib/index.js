const log = console.log
import fse from 'fs-extra'
import JSON5 from 'json5'
import os from 'os'
import readline from 'readline'
import chalk from 'chalk'
// import glob from 'glob'
// import { getUnitDocs, saveUnitDocs, getUnitDicts, saveUnitDicts, searchDict } from './pouchdb.js'
import {oxia, comb, plain, strip} from 'orthos'

import clipboardy from 'clipboardy'

let qs = process.argv.slice(2)
const homedir = os.homedir();
const circle = ' ⬤ '  // •

// export async function init(params) {
export async function fanki(config) {
  log('_FANKI INIT', config)

  return

  // let config = readConf()
  // config  = lookupHeap(config, params)
  if (!config.dbn) return
  let unitname = config.dbn
  log('_unitname', unitname)

  // let unitdocs = await getUnitDocs(config.dbn)
  let unitdocs = []
  if (!unitdocs.length) {
    let str = getFile(config)
    if (!str) return
    let docs = parseDocs(str)
    // await saveUnitDocs(config.dbn, docs)
    unitdocs = docs
  }

  // let unitdicts = await getUnitDicts(config.dbn)
  let unitdicts = []
  if (!unitdicts.length) {
    if (true) {
      let dictstr = getDictFile(config)
      let dicts = parseDicts(dictstr)
      // await saveUnitDicts(config.dbn, dicts)
      unitdicts = dicts
    }
  }
  startFanki(unitname, unitdocs)
}

function startFanki(unitname, cards) {
  log(cards.length, chalk.green('cards found, use arrows to start'))
  const input = process.stdin

  const rl = readline.createInterface({
    input: input,
    output: process.stdout,
  })

  // rl.write(null, { ctrl: true, name: 'l' })

  let card = {
    desc() {
      let desc = this.current.descs[this.step]
      if (!desc) {
        this.random()
        desc = this.current.descs[this.step]
      }
      desc = desc.replace(/\.$/, '')
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

    async symbol() {
      let pos = rl.cursor
      let desc = card.desc()
      let symbol = desc[pos-1]
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      if (!symbol) {
        log(chalk.red('dict: no result:'), symbol)
        this.show()
        return
      }
      let dict = await searchDict(unitname, symbol)
      if (dict && dict.rdict) {
        let article = dict.article || dict.rdict
        let answer = [article, dict.trns].join(': ')
        log(chalk.green('dict: '), answer)
      } else {
        log(chalk.red('dict: no result:'), symbol)
      }
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      this.show()
    },

    async dict() {
      let pos = rl.cursor
      let desc = card.desc()
      let wf = getWordAt(desc, pos)
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      let dict = await searchDict(unitname, wf)
      if (dict && dict.rdict) {
        let article = dict.article || dict.rdict
        let answer = [article, dict.trns].join(': ')
        log(chalk.green('dict: '), answer)
      } else {
        log(chalk.red('dict: no result:'), wf)
      }
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      this.show()
    },

    ctrlV() {
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      let clip = clipboardy.readSync()
      this.current = {descs: [clip, '']}
      rl.write(clip)
    },

    random() {
      rl.setPrompt(chalk.green(circle))
      let idx = getRandomInt(cards.length)
      this.current = cards[idx]
      this.step = 0
    }
  }

  rl.prompt()
  rl.setPrompt(chalk.green(circle))
  input.setEncoding('utf8')


  readline.emitKeypressEvents(input);
  input.setRawMode(true);

  input.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else {
      if (key.name == 'down' && key.shift) {
        rl.setPrompt(chalk.red(circle))
        card.show()
      } else if (key.name == 'down') {
        card.random()
        card.show()
      } else if (key.name == 'up' && key.shift) {
        rl.setPrompt(chalk.green(circle))
        card.show()

      } else if (key.name == 'v') {
        card.ctrlV()

      } else if (key.name == 'd') {
        card.dict()
      } else if (key.name == 's') {
        card.symbol()
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

// function lookupHeap(config, params) {
//   let srcdir = config.heap
//   let resrc = new RegExp('^' + srcdir + '/')
//   let pattern = [srcdir, '**/*'].join('/')
//   let fns = glob.sync(pattern)
//   config.fns = fns.length
//   let restricted = fns.map(fn=> fn.replace(resrc, ''))
//   params.forEach(query=> {
//     let req = new RegExp(query, 'i')
//     restricted = restricted.filter(fn=> req.test(fn))
//   })
//   if (restricted.length > 1) {
//     log(chalk.red('_found too many possible files'))
//     console.log(restricted)
//   }
//   else if (restricted.length == 0) log(chalk.red('_no possible file found'))
//   else if (restricted.length == 1) {
//     config.dbn = restricted[0]
//   }
//   return config
// }

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getFile(config) {
  let fpath = config.dbn
  fpath = '../../heap/' + fpath
  const file = new URL(fpath, import.meta.url);
  let filePath = file.pathname
  log('_FP', filePath)
  try {
    return fse.readFileSync(filePath).toString().trim()
  } catch (err) {
    log('_ERR FILE CARDS')
  }
  return ''
}

// zho/YOYO/yoyo_03.md
function getDictFile(config) {
  let fpath = '../../heap/grc/attic-dict.md'
  let dirs = config.dbn.split('/').slice(0,-1)
  let dictpath, dirpath, fns, fn
  let dict = ['..', config.heap].join('/')
  dirs.forEach(dir=> {
    if (dictpath) return // first founded dict for now.
    dict += '/' + dir
    dirpath = new URL(dict, import.meta.url).pathname
    fns = fse.readdirSync(dirpath)
    fn = fns.find(fn=> /dict/.test(fn))
    if (fn) dictpath = [dirpath, fn].join('/')
  })
  if (!dictpath) return ''
  try {
    return fse.readFileSync(dictpath).toString().trim()
  } catch (err) {
    log('_ERR DICTS')
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
    if (row.slice(0,2) == '# ') {
      comm = ''
      return
    } else if (row.slice(0,3) == '## ') {
      comm = ''
      return
    } else if (row.slice(0,4) == '### ') {
      row = row.slice(0,4)
      comm = row
    } else if (row.slice(0,3) == '###' || row.slice(0,2) == '##' || row.slice(0,1) == '#') {
      comm = ''
      return
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
  // rows = rows.slice(2,6)
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
