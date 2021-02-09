import wrap from 'routes/wrap'
import { find } from 'db'
import { convertFieldValuesToUi } from 'db/constants'
import { toBoolean, isEmpty } from 'validator'
import { isNil, mergeRight } from 'ramda'

// eslint-disable-next-line
import { red, green, logRequest } from 'logger'
import { wdTransactions } from '../../appWords'

const isEmptyOrUndefined = (val) => {
  if (isNil(val)) {
    return true
  }
  return isEmpty(val)
}

const dataGet = wrap(async (req, res, next) => {
  const { params } = req
  green('params', params)
  const { description, showOmitted } = params
  const desc = isEmptyOrUndefined(description)
    ? {}
    : { description: { $regex: description, $options: 'im' } }
  const omitted = toBoolean(showOmitted) ? {} : { omit: false }
  const filter = mergeRight(desc, omitted)
  const data = await find({ collection: wdTransactions, filter: filter })
  res.send(convertFieldValuesToUi(data))
})

export default dataGet
