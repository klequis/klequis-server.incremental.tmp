import wrap from 'routes/wrap'
import { findById } from 'db/dbFunctions'
import { wdRules, convertFieldValuesToUi } from 'db/constants'

// eslint-disable-next-line
import { red, green, yellow, logRequest } from 'logger'

const ruleGet = wrap(async (req, res) => {
  // try {
  const { params } = req
  const { ruleid } = params
  const f = await findById(wdRules, ruleid)
  res.send({ data: convertFieldValuesToUi(f), error: null })
  // } catch (e) {
  //   throw e
  // }
})

export default ruleGet
