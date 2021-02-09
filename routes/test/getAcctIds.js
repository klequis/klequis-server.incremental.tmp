import wrap from 'routes/wrap'
import { find } from 'db'
import { wdAccounts } from 'appWords'
import * as R from 'ramda'

// eslint-disable-next-line
import { yellow } from 'logger'

export const getAcctIds = async (req, res) => {
  const r = await find({
    collection: wdAccounts,
    projection: { _id: 0, acctId: 1 }
  })
  return R.map((doc) => doc.acctId, r)
}

export const getAcctIdsRequest = wrap(async (req, res) => {
  const r = await find({
    collection: wdAccounts,
    projection: { _id: 0, acctId: 1 }
  })
  const ids = R.map((doc) => doc.acctId, r)
  res.send(ids)
})
