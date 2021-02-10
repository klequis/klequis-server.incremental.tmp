import wrap from 'routes/wrap'
import { find } from 'db'
import { convertFieldValuesToUi } from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'

// eslint-disable-next-line
import { red, green, logRequest } from 'logger'
import { wdTransactions } from 'appWords'

const dataGetByCriteria = wrap(async (req, res, next) => {
  const { body } = req
  // body is an array

  const { field, operator, value } = body
  const filter = filterBuilder([{ field, operator, value }])
  const data = await find({ collection: wdTransactions, filter: filter })
  res.send({ data: convertFieldValuesToUi(data), error: null })
})

export default dataGetByCriteria
