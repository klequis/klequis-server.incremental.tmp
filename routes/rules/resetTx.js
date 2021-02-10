import { updateMany } from 'db'
import { wdTransactions } from 'appWords'

export const resetTx = async (ruleObjId) => {
  return updateMany({
    collection: wdTransactions,
    filter: { ruleIds: ruleObjId },
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
}
