const log = console.log
import fse from 'fs-extra'
import JSON5 from 'json5'
import os from 'os'
import readline from 'readline'
import chalk from 'chalk'
import path from 'path'
import { getInfo, setInfo, getUnitDocs, saveUnitDocs, getUnitDicts, saveUnitDicts, searchDict, updateColor } from './pouchdb.js'
import {oxia, comb, plain, strip} from 'orthos'

import clipboardy from 'clipboardy'

let qs = process.argv.slice(2)
const homedir = os.homedir();
const circle = ' ⬤ '  // •

export async function fanki(config) {
  if (!config.unit) return
  let uname = config.unit

  let info = await getInfo()
  if (!info[uname]) info[uname] = {}
  let changedate = await fileDate(uname)
  let unitdocs = []

  if (info[uname].changedate == changedate) {
    unitdocs = await getUnitDocs(uname)
  } else {
    info[uname].changedate = changedate
    let str = getFile(uname)
    if (!str) return
    let newdocs = parseDocs(str)
    await saveUnitDocs(uname, newdocs)
    unitdocs = newdocs
  }

  let  dictsnum = dictsNumber(config)

  if (info[uname].dictsnum != dictsnum) {
    info[uname].dictsnum = dictsnum
    let dictdocs = collectDicts(config)
    await saveUnitDicts(uname, dictdocs)
  }
  await setInfo(info)
  startFanki(uname, unitdocs)
}

function startFanki(uname, cards) {
  log(cards.length, chalk.green('cards found, down arrow to start'))
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
      let dict = await searchDict(uname, symbol)
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
      let pos = rl.cursor - 1
      let desc = card.desc()
      let wf = getWordAt(desc, pos)
      rl.write(null, { ctrl: true, name: 'a' })
      rl.write(null, { ctrl: true, name: 'k' })
      let dict = await searchDict(uname, wf)
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
      let idx = getRandomInt(cards.length)
      this.current = cards[idx]
      this.step = 0
      this.setPrompt()
    },

    async changeColor(dir) {
      let doc = this.current
      if (!doc.color) doc.color = 0
      if (dir && doc.color < 2) doc.color +=1
      else if (!dir && doc.color > 0) doc.color -=1
      this.setPrompt()
      let res = await updateColor(uname, doc)
      this.show()
    },

    setPrompt() {
      let doc = this.current
      if (!doc.color) doc.color = 0
      if (doc.color == 0) rl.setPrompt(chalk.green(circle))
      else if (doc.color == 1) rl.setPrompt(chalk.yellowBright(circle))
      else if (doc.color == 2) rl.setPrompt(chalk.red(circle))
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
        card.changeColor(true)
      } else if (key.name == 'up' && key.shift) {
        card.changeColor()
      } else if (key.name == 'down') {
        card.random()
        card.show()
      } else if (key.name == 'up') {
        card.random()
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getFile(uname) {
  try {
    return fse.readFileSync(uname).toString().trim()
  } catch (err) {
    log('_ERR FILE CARDS', uname)
  }
  return ''
}

function dictsNumber(config) {
  let dirs = config.unit.split('/')
  let dictpath, dirpath, fns, fn
  let dictsnum = 0

  let dpath, heappath
  for (let dname of dirs) {
    if (heappath) continue
    dictsnum += 1
    dirs.pop()
    dpath = dirs.join('/')
    if (dpath === config.heap) heappath = config.heap
  }
  return dictsnum
}

function collectDicts(config) {
  let dirs = config.unit.split('/')
  let dictpath, dirpath, fns, fn

  let dictdocs = []
  let dpath, heappath
  for (let dname of dirs) {
    if (heappath) continue
    dirs.pop()
    dpath = dirs.join('/')
    if (dpath === config.heap) heappath = config.heap
    let dirdicts = getDictFiles(dpath)
    dictdocs.push(...dirdicts)
  }
  return dictdocs
}

function getDictFiles(dpath) {
  let dicts = []
  let fns = fse.readdirSync(dpath)
  let dfns = fns.filter(fn=> /dict/.test(fn))
  if (!dfns.length) return []
  for (let dfn of dfns) {
    let dictpath = path.resolve(dpath, dfn)
    let str, locdicts
    try {
      str = fse.readFileSync(dictpath).toString().trim()
      locdicts = parseDicts(str)
      dicts.push(...locdicts)
    } catch(err) {
      console.log('_ERR dict file_', dictpath)
    }
  }
  return dicts
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
  rows.forEach(row=> {
    if (!row) return
    dict = {}
    let arr = row.trim().split(' = ')
    article = arr[0].split('(')[0].trim()
    let rdict = article.split(/,| or/)[0]
    dict.rdict = rdict
    dict.dict = comb(rdict)
    dict.article = (article == rdict) ? '' : article
    dict.trns = arr.slice(1).join('; ')
    dicts.push(dict)
  })
  return dicts
}

// https://stackoverflow.com/questions/5173316/finding-the-word-at-a-position-in-javascript
function getWordAt (str, pos) {
  str = String(str);
  pos = Number(pos) >>> 0;
  let left = str.slice(0, pos + 1).search(/\S+$/),
      // let left = str.slice(0, pos + 1).search(/\S+\s*/),
      right = str.slice(pos).search(/\s/);
  if (right < 0) {
    return str.slice(left);
  }
  return str.slice(left, right + pos);
}

async function fileDate(path) {
  try {
    let data = fse.statSync(path)
    return data.mtime.toISOString()
  } catch(err) {
    log('_FILE CHANGE ERR', err)
  }
  fse.stat(path, (err, data)=> {
    return data.mtime.toISOString()
  })
}
