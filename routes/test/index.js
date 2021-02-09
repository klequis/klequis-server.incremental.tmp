import express from 'express'
// import test1 from './test1'
import convertDebitValueToNumber from './convertDebitValueToNumber'
import update1FieldWithAnother from './update1fieldWithAnother'
import { getAcctIdsRequest } from './getAcctIds'
import { getLastTxDateByAcctRequest } from './getLastTxDateByAcct'
import { findDuplicateTxRequest } from './findDuplicateTx'

// duplicates
import { duplicatesCheckNew } from './duplicatesCheckNew'
import { duplicatesByAccountGet } from './duplicatesByAccountGet'

const router = express.Router()

// router.get('/test1', test1)
router.get('/convert-debit-value-to-number', convertDebitValueToNumber)
router.get('/update-1-field-with-another', update1FieldWithAnother)
router.get('/duplicates-by-account', duplicatesByAccountGet)
router.get('/check-new-duplicates', duplicatesCheckNew)
router.get('/get-acct-ids', getAcctIdsRequest)
router.get('/get-last-tx-date-by-acct', getLastTxDateByAcctRequest)
router.get('/find-duplicate-tx', findDuplicateTxRequest)

export default router
