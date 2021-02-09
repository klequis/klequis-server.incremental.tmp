import wrap from 'routes/wrap'
import { convertCriteriaValuesToDb, wdRules } from 'db/constants'
import { findOneAndUpdate } from 'db'
import runRules from 'actions/runRules'
import { toString } from 'lib'
import { ObjectId } from 'mongodb'
import { resetTx } from './resetTx'

// eslint-disable-next-line
import { red, redf, green, yellow, logRequest } from 'logger'

const rulePatch = wrap(async (req, res) => {
  const { body, params } = req

  // body is a rule
  const { _id, criteria, actions } = body
  const { ruleid: paramsId } = params

  if (toString(paramsId) !== toString(_id)) {
    throw new Error(
      `_id in params ${paramsId} does not match _id in body ${_id}`
    )
  }

  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  // TODO check if is likely mongodb_id before trying to convert
  const ruleObjId = ObjectId.createFromHexString(_id)

  const ret = resetTx(ruleObjId)
  console.log('ret', ret)

  // await updateMany

  await findOneAndUpdate(
    wdRules,
    { _id: _id },
    {
      $set: { criteria: convertedCriteria, actions: actions }
    },
    false
  )

  await runRules(_id)
  res.send(ret)
})

export default rulePatch
