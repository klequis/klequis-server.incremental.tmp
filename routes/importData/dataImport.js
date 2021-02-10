import { createIndex, dropCollection, find, insertMany } from 'db'
import { wdAccounts, transactionFields as tFields } from 'db/constants'
import { readCsvFile } from './readCvsFile'
import runRules from 'actions/runRules'
import { transformData } from './transformData'
import R from 'ramda'
import { fileExists } from 'lib/fileExists'
const path = require('path')

// eslint-disable-next-line
import { green, red, redf, yellow, greenf } from 'logger'
import { wdTransactions } from 'appWords'

/**
 * @description drop the transactions and raw-data collection
 */
const _dropDatabases = async () => {
  await dropCollection(wdTransactions)
  await dropCollection('raw-data')
}

/**
 * @description get list of active accounts
 */

const _getAccounts = async () => {
  return find({
    collection: wdAccounts,
    filter: {
      active: { $ne: false }
    }
  })
}

// /**
//  *
//  * @param {string} acctId
//  * @param {array} rawData
//  */
// const _loadRawData = async (acctId, rawData) => {
//   const data = R.map((doc) => R.mergeRight(doc, { acctId }), rawData)
//   await insertMany('raw-data', data)
// }

/**
 * @description Create index on 'description' & 'type'
 */
const _createIndices = async () => {
  await createIndex(wdTransactions, tFields.description.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
  await createIndex(wdTransactions, tFields.type.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
}

/**
 * @param {object} accounts array of account objects
 * @description Returns array of accounts for which import files exist
 */
const _chkAcctFilesExist = async (accounts) => {
  const all = await Promise.all(
    accounts.map(async (a) => {
      const fullName = path.join('data', a.dataFilename)
      return R.mergeRight(a, {
        fullName: fullName,
        exists: await fileExists(fullName)
      })
    })
  )
  return all.filter((a) => a.exists)
}

/**
 * @param {array} data the transactions for the account
 * @param {object} acct an account
 * @return {object} data & acct in one object
 */
const zipFn = (data, acct) => {
  return {
    account: acct,
    data: data.data
  }
}

/**
 * @param {array} data all tx
 * @param {array} accounts all accounts
 * @description return data & corresponding acct in one object
 */
const mergeAccountsAndData = (data, accounts) => {
  return R.zipWith(zipFn, data, accounts)
}

/**
 * @param {object} acctWithData
 * @description Print expected count match to console
 */
const _printAcctNumChk = (acctWithData) => {
  const { account, data } = acctWithData
  const { acctId, expectedTxCount } = account
  /* data shape is
    {
      acctid: '1234'
      data: [
        {}, {}
      ]
    }

    Pick just the data
  */

  const dataLen = data.length
  const msg = `expected ${expectedTxCount}, actual ${dataLen}`
  dataLen === expectedTxCount ? greenf(acctId, msg) : redf(acctId, msg)
}

/**
 * @description import data from all existing data files
 */
const dataImport = async () => {
  await _dropDatabases()

  const allAccts = await _getAccounts() // a database call

  const validAccts = await _chkAcctFilesExist(allAccts)

  /*
      returns [
        {
          acctId: '1234'
          data: [
            {}, {}
          ]
        }
      ]
  */
  const allData = await Promise.all(R.map(readCsvFile, validAccts))

  /*
      returns [
        {
          account: {}
          data: [
            {}, {}
          ]
        }
      ]
  */
  const acctsWithData = mergeAccountsAndData(allData, validAccts)

  R.forEach(_printAcctNumChk, acctsWithData)

  const finalData = R.unnest(R.map(transformData, acctsWithData))
  const inserted = await insertMany({
    collection: wdTransactions,
    data: finalData
  })
  await _createIndices()
  // TODO: re-enable
  await runRules()
  return inserted
}

export default dataImport
