import wrap from 'routes/wrap'
import { executeAggregate, find, updateMany } from 'db/dbFunctions'
import { duplicateStatus } from 'db/constants'
import * as R from 'ramda'
import { ObjectID } from 'mongodb'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'
import { wdTransactions } from '../../appWords'

export const duplicatesCheckNew = wrap(async (req, res) => {
  const match1 = {
    $match: {}
  }

  const group1 = {
    $group: {
      _id: {
        origDescription: '$origDescription',
        date: '$date',
        debit: '$debit',
        credit: '$credit'
      },
      count: { $sum: 1 },
      ids: {
        $addToSet: {
          _id: '$_id'
        }
      }
    }
  }

  const match2 = {
    $match: { count: { $gt: 1 } }
  }

  const project1 = {
    $project: {
      _id: false,
      count: false
    }
  }

  const q = [match1, group1, match2, project1]

  const ret = await executeAggregate({ collection: wdTransactions, query: q })

  // process ret

  const getIds = (obj) => obj.ids

  const appendItObj = (obj) => {
    return R.map((x) => x._id, obj)
  }

  const toArrayOfIds = R.pipe(
    R.tap(_log('initial')),
    getIds,
    R.tap(_log('getIds')),
    appendItObj,
    R.tap(_log('appendItObj', appendItObj))
  )

  const asObj = R.map(toArrayOfIds, ret)

  const flat = R.flatten(asObj)

  await updateMany({
    collection: wdTransactions,
    filter: { _id: { $in: flat } },
    update: {
      $set: {
        duplicateId: new ObjectID(),
        duplicateStatus: duplicateStatus.duplicateNew,
        duplicate: true
      }
    }
  })

  const f = await find({
    collection: wdTransactions,
    filter: { _id: { $in: flat } }
  })
  yellow('WARN', 'should convert values ToUi?')
  res.send({ data: f, error: null })
})
