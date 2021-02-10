import wrap from 'routes/wrap'
import { executeAggregate } from 'db'
import { getAcctIds } from './getAcctIds'
import { wdTransactions } from 'appWords'

export const findDuplicateTx = async (req, res) => {
  const acctIds = await getAcctIds()

  const match1 = {
    $match: {
      acctId: { $in: acctIds }
    }
  }

  const group1 = {
    $group: {
      _id: {
        acctId: '$acctId',
        date: '$date',
        description: '$description',
        amount: '$amount'
      },
      count: { $sum: 1 }
    }
  }

  const match2 = {
    $match: { count: { $gt: 1 } }
  }

  const project1 = {
    $project: {
      _id: 0,
      acctId: '$_id.acctId',
      date: '$_id.date',
      description: '$_id.description',
      amount: '$_id.amount',
      count: '$count'
    }
  }

  const q = [match1, group1, match2, project1]

  return executeAggregate({ collection: wdTransactions, query: q })
}

export const findDuplicateTxRequest = wrap(async (req, res) => {
  const ret = await findDuplicateTx()

  res.send({
    count: ret.length,
    data: ret
  })
})
