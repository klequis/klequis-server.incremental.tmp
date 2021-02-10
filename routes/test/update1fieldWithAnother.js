import wrap from 'routes/wrap'
import { executeAggregate, find, updateMany } from 'db/dbFunctions'
import { ObjectID, ObjectId } from 'mongodb'
import {
  wdCategory1,
  wdCategory2,
  wdDescription,
  wdRuleIds,
  wdTransactions
} from 'appWords'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

const update1FieldWithAnother = wrap(async (req, res) => {
  // db.students.updateMany({ _id: 3 }, [
  //   { $set: { test3: 98, modified: '$$NOW' } }
  // ])

  const objId = ObjectId('5febf3d0debc0e6d35aee579')

  const ret = updateMany({
    collection: wdTransactions,
    filter: { ruleIds: objId },
    update: [
      {
        $set: {
          [wdCategory1]: '',
          [wdCategory2]: '',
          // [wdRuleIds]: [],
          [wdDescription]: '$origDescription'
        }
      }
    ]
  })

  res.send(ret)
  // res.send({
  //   count: ret.length,
  //   data: ret
  // })
})

export default update1FieldWithAnother
