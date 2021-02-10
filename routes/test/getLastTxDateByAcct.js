import wrap from 'routes/wrap'
import { find } from 'db'
import { wdTransactions } from 'appWords'

export const getLastTxDateByAcct = async (acctId) => {
  return find({
    filter: { acctId },
    collection: wdTransactions,
    sort: { date: -1 },
    limit: 1
  })
}

export const getLastTxDateByAcctRequest = wrap(async (req, res) => {
  const r = await getLastTxDateByAcct('7123.chk.chase.cb')

  // so it now works with an acct id
  // Use getAcctIds with Promise.all & R.map to create an object
  // with last tx date for all accounts.
  res.send(r)
})
