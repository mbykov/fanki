const log = console.log
import pouchdb from 'pouchdb'
import fse from 'fs-extra'
import os from 'os'
import md5 from 'md5'
const homedir = os.homedir();
// import orthos from 'orthos'
import {oxia, comb, plain, strip} from 'orthos'
// process.env['HOME']

// log('_HOMEDIR_', homedir)
let dbPath = homedir + '/.fanki/pouch/docs'
fse.ensureDirSync(dbPath)
let infoPath = homedir + '/.fanki/pouch/info'
fse.ensureDirSync(infoPath)
// log('_dbPath', dbPath)
const dbdocs = new pouchdb(dbPath);
const dbinfo = new pouchdb(infoPath);

export function docsInfo() {
  return dbdocs.info()
    .then(function (info) {
      return info
    })
    .catch(err=> {
      log('_db_info ERR:')
    })
}

export function dbInfo() {
  return dbinfo.info()
    .then(function (info) {
      return info
    })
    .catch(err=> {
      log('_db_info ERR:')
    })
}

export function saveDocs(docs) {
  docs.forEach((doc, idx)=> {
    let wf  = doc.descs[0]
    doc._id = md5(wf)
  })

  return dbdocs.bulkDocs(docs)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      log('_bulk_docs ERR:', err)
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

export function getUnitDocs(dbn) {
  let startkey= md5(dbn)
  let endkey= startkey + '\ufff0'
  // log('___STARTKEY', startkey)
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

export function allDocs() {
  return dbdocs.allDocs({include_docs: true})
    .then(function (res) {
      let docs = res.rows.map(row=> row.doc)
      return docs
    })
    .catch(err=> {
      log('_all_docs ERR:')
    })
}

export function allDBs() {
  return dbdocs.allDocs({include_docs: true})
    .then(function (res) {
      let docs = res.rows.map(row=> row.doc)
      return docs
    })
    .catch(err=> {
      log('_all_docs ERR:')
    })
}
