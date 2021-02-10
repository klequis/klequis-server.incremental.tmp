import wrap from 'routes/wrap'
import { executeAggregate } from 'db/dbFunctions'
import { convertFieldValuesToUi } from 'db/constants'
import * as R from 'ramda'

// eslint-disable-next-line
import { redf, yellow } from 'logger'
import { wdTransactions } from 'appWords'

const match1 = {
  $match: {
    duplicate: true
  }
}

const group1 = {
  $group: {
    _id: {
      acctId: '$acctId'
    },
    docs: {
      $addToSet: '$$ROOT'
    }
  }
}

const replaceId = (doc) => {
  return {
    acctId: R.path(['_id', 'acctId'])(doc),
    docs: R.path(['docs'])(doc)
  }
}

const duplicatesGet = wrap(async (req, res) => {
  const q = [match1, group1]
  const ret = await executeAggregate({ collection: wdTransactions, query: q })
  const y = R.map(replaceId, ret)
  res.send({ data: convertFieldValuesToUi(y), error: null })
})

export default duplicatesGet
