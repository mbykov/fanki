const log = console.log
import pouchdb from 'pouchdb'
import fse from 'fs-extra'
import os from 'os'
import md5 from 'md5'
const homedir = os.homedir();
import {oxia, comb, plain, strip} from 'orthos'
// process.env['HOME']

let dbPath = homedir + '/.fanki/pouch/docs'
fse.ensureDirSync(dbPath)
const dbdocs = new pouchdb(dbPath);

let dictPath = homedir + '/.fanki/pouch/dicts'
fse.ensureDirSync(dictPath)
const dbdicts = new pouchdb(dictPath);

let lang = 'grc'

export function getUnitDocs(dbn) {
  let startkey= md5(dbn)
  let endkey= startkey + '\ufff0'
  let options = {include_docs: true, startkey, endkey}
  return dbdocs.allDocs(options)
    .then(function (res) {
      let docs = res.rows.map(row=> row.doc)
      return docs
    })
    .catch(err=> {
      log('_all_docs ERR:')
    })
}

export function saveUnitDocs(dbn, docs) {
  docs.forEach((doc, idx)=> {
    let wf  = doc.descs[0]
    let prefix = md5(dbn)
    let suffix = md5(wf)
    doc._id = [prefix, suffix].join('-')
  })

  return dbdocs.bulkDocs(docs)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      log('_bulk_docs ERR:', err)
    })
}

export function getUnitDicts(dbn) {
  let startkey= md5(dbn)
  let endkey= startkey + '\ufff0'
  let options = {include_docs: true, startkey, endkey}
  return dbdicts.allDocs(options)
    .then(function (res) {
      let docs = res.rows.map(row=> row.doc)
      return docs
    })
    .catch(err=> {
      log('_all_docs ERR:')
    })
}

export function saveUnitDicts(dbn, docs) {
  docs.forEach((doc, idx)=> {
    let prefix = md5(dbn)
    let suffix = md5(doc.dict)
    doc._id = [prefix, suffix].join('-')
  })

  return dbdicts.bulkDocs(docs)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      log('_bulk_docs ERR:', err)
    })
}

export function searchDict(dbn, rdict) {
  rdict = rdict.replace(/,/, '')
  let dict = oxia(comb(rdict))
  // dict =  'γνώμη'
  let prefix = md5(dbn)
  let suffix = md5(dict)
  let query = [prefix, suffix].join('-')

  // rdict: 'γνώμη',
  // dict: 'γνώμη',
  // article: 'γνώμη, -ης, f.',
  // trns: ' faculty of judgment; opinion',
  let _id = 'ea31a526fdbe14552bba36dbd774dfe4-0270cdd0b9638511fadfba3de019642c'
  // query = _id
  // log('_q', query)
  // log('_id', _id)

  return dbdicts.get(query)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      // log('_search_dict ERR:', err.reason)
    })
}
