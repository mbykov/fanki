const log = console.log
import pouchdb from 'pouchdb'
import fse from 'fs-extra'
import os from 'os'
const homedir = os.homedir();
// process.env['HOME']

log('_HOMEDIR_', homedir)
let dbPath = homedir + '/.fanki/pouch'
fse.ensureDirSync(dbPath)
log('_dbPath', dbPath)

export function dbInfo() {
  const pouch = new pouchdb(dbPath);
  return pouch.info()
    .then(function (info) {
      return info
    })


  return 'db-list'
}
