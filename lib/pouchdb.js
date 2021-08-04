const log = console.log
import pouchdb from 'pouchdb'
import fse from 'fs-extra'
import os from 'os'
import md5 from 'md5'
const homedir = os.homedir();
import {oxia, comb, plain, strip} from 'orthos'

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
  rdict = rdict.replace(/[,\.]/g, '')
  let dict = oxia(comb(rdict))
  let prefix = md5(dbn)
  let suffix = md5(dict)
  let query = [prefix, suffix].join('-')

  return dbdicts.get(query)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      // log('_search_dict ERR:', err.reason)
    })
}

export function updateColor(dbn, doc) {
  return dbdocs.put(doc)
    .then(function (res) {
      doc._rev = res.rev
      return res
    })
    .catch(err=> {
      // log('_search_dict ERR:', err.reason)
    })
}
