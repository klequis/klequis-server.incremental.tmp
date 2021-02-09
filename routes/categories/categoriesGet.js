import wrap from 'routes/wrap'
import { find } from 'db'
import { wdCategories } from 'appWords'

// eslint-disable-next-line
import { green, logRequest } from 'logger'

const categories = wrap(async (req, res, next) => {
  const data = await find({ collection: wdCategories })
  // TODO: incorrect data format
  res.send(data)
})

export default categories
