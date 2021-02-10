import wrap from 'routes/wrap'
import { executeAggregate } from 'db/dbFunctions'
import { sortBy, compose, toLower, prop } from 'ramda'

// eslint-disable-next-line
import { red, green, logRequest } from 'logger'
import {
  wdCategory1,
  wdCategory2,
  wdId,
  wdRuleIds,
  wdTransactions
} from 'appWords'

// const sortByNameCaseInsensitive = sortBy(compose(toLower, prop('name')))

const sortByOrig = sortBy(compose(toLower, prop('_id')))

const changesByDataDoc = wrap(async (req, res, next) => {
  const group1 = {
    $group: {
      _id: '$description',
      cat1: { $addToSet: '$category1' },
      cat2: { $addToSet: '$category2' },
      orig: { $push: '$origDescription' },
      ruleIds: { $addToSet: '$ruleIds' }
    }
  }
  const q = [group1]

  const ret = await executeAggregate({ collection: wdTransactions, query: q })

  const a = ret.map((r) => {
    const flatRules = r.ruleIds.flat()
    green('flatRules', flatRules)
    green('r', r)
    const x = {
      [wdId]: r._id,
      orig: r.orig,
      [wdCategory1]: r.cat1,
      [wdCategory2]: r.cat2,
      [wdRuleIds]: flatRules
    }
    return x
  })
  const b = sortByOrig(a)
  res.send(b)
})

export default changesByDataDoc
