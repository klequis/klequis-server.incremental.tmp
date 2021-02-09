import wrap from 'routes/wrap'
import { executeAggregate, find, findWithSort } from 'db'
import // wdAccounts
// transactionFields as tFields
'db/constants'
import * as R from 'ramda'
import { yellow } from 'logger'
import { getAcctIds } from './getAcctIds'
import mongodb, { ObjectID } from 'mongodb'
import { wdTransactions } from '../../appWords'

// const MongoClient = mongodb.MongoClient
// const assert = require('assert').strict

// const getLastDate = async (acctId) => {
//   const r = await find({ collection: wdTransactions, filter { acctId: acctId }})
//   // const x = r.sort({ date: -1 }).limit(1)
//   // yellow('x', x)
//   // yellow('r', r)
//   return r
// }

// export const zz_getLastTxDateByAcctRequest = wrap(async (req, res) => {
//   const acctIds = await getAcctIds()

//   yellow('acctIds', acctIds)

//   // const all = await Promise.all(R.map(getLastDate, acctIds))

//   const a = await getLastDate(acctIds[0])
//   a.forEach((element) => {
//     console.log(element.date)
//   })
//   res.send(a)
// })

export const getLastTxDateByAcctRequest = wrap(async (req, res) => {
  yellow('start')
  const filter = {}
  // const projection = {
  //   date: 1,
  //   _id: 0
  // }
  const sort = {
    date: -1
  }
  yellow('before connect')

  const r = await findWithSort({
    collection: wdTransactions,
    // filter: {},
    sort
  })

  res.send(r)
  // client.close()
})
