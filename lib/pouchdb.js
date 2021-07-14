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
    let suffix = md5(doc.rdict)
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

export function searchDict(dbn, wf) {
  let prefix = md5(dbn)
  let suffix = md5(wf)
  let query = [prefix, suffix].join('-')

  return dbdicts.get(query)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      log('_search_dict ERR:', err)
    })
}
