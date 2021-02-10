import wrap from 'routes/wrap'
import { wdRules, convertCriteriaValuesToDb } from 'db/constants'
import { insertOne, find, updateMany } from 'db/dbFunctions'
import { ObjectID } from 'mongodb'
import runRules from 'actions/runRules'
import { filterBuilder } from 'actions/filterBuilder'
import * as R from 'ramda'

// eslint-disable-next-line
import { yellow, redf, blue } from 'logger'
import { wdTransactions } from 'appWords'

const replaceTmpId = (obj) => {
  return R.mergeRight(obj, { _id: ObjectID() })
}

const rulePost = wrap(async (req, res) => {
  yellow('rulePost', 'POST')
  const { body } = req
  // new rule could be sent with tmp ids. Remove them
  const { criteria, actions } = body

  // Change number types to number
  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  const filter = filterBuilder(convertedCriteria)
  const affectedTxIds = await find({
    collection: wdTransactions,
    filter,
    projection: {
      _id: 1
    }
  })
  const updateFilter = {
    _id: { $in: R.map((x) => ObjectID(x._id), affectedTxIds) }
  }

  updateMany({
    collection: wdTransactions,
    filter: updateFilter,
    update: [
      {
        $set: {
          category1: '',
          category2: '',
          ruleIds: [],
          description: '$origDescription'
        }
      }
    ]
  })

  const newRule = {
    criteria: convertedCriteria.map((c) => replaceTmpId(c)),
    actions: actions.map((a) => replaceTmpId(a))
  }

  const i = await insertOne({ collection: wdRules, data: newRule })
  yellow('rulePost: inserted', i)
  const { _id } = i[0]
  await runRules(_id)
  // TODO: what s/b returned here
  res.send({ a: 'b' })
})

export default rulePost
