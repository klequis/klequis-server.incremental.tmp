import wrap from 'routes/wrap'
import { find } from 'db/dbFunctions'
import { convertFieldValuesToUi } from 'db/constants'

// eslint-disable-next-line
import { redf, yellow } from 'logger'
import { wdTransactions } from '../../appWords'

const duplicatesGet = wrap(async (req, res) => {
  const data = await find({
    collection: wdTransactions,
    filter: { duplicate: true }
  })
  res.send({ data: convertFieldValuesToUi(data), error: null })
})

export default duplicatesGet
