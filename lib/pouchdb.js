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
let dbPath = homedir + '/.fanki/pouch'
fse.ensureDirSync(dbPath)
// log('_dbPath', dbPath)
const pouch = new pouchdb(dbPath);

export function dbInfo() {
  // const pouch = new pouchdb(dbPath);
  return pouch.info()
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
    // let _id = plain(comb(wf))
    doc._id = md5(wf)
  })

  return pouch.bulkDocs(docs)
    .then(function (res) {
      return res
    })
    .catch(err=> {
      log('_bulk_docs ERR:', err)
    })
}

export function allDocs() {

  return pouch.allDocs({include_docs: true})
    .then(function (res) {
      let docs = res.rows.map(row=> row.doc)
      return docs
    })
    .catch(err=> {
      log('_all_docs ERR:')
    })
}
