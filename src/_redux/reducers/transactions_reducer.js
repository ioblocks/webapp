// Copyright 2016-2017 Rigo Investment Sagl.

import { ADD_TRANSACTION, UPDATE_TRANSACTIONS } from '../actions/const'
import initialState from './initialState'

function transactionsReducer(state = initialState.transactions, action) {
  let pendingTransactions = 0
  switch (action.type) {
    case ADD_TRANSACTION:
      let transactions = Object.assign({}, state)
      const newTransaction = { ...action.payload.transactionDetails }
      const oldTransaction = transactions.queue.get(
        action.payload.transactionId
      )
      const updatedTransaction = { ...oldTransaction, ...newTransaction }
      transactions.queue.set(action.payload.transactionId, updatedTransaction)
      transactions.queue.forEach(value => {
        if (
          value.status !== 'executed' &&
          value.status !== 'error' &&
          value.cancelled !== true &&
          typeof value.cancelled === 'undefined'
        ) {
          pendingTransactions = pendingTransactions + 1
        }
      })
      transactions.pending = pendingTransactions
      return {
        ...state,
        ...transactions
      }
    case UPDATE_TRANSACTIONS:
      pendingTransactions = 0
      transactions = new Map(action.transactions)
      transactions.forEach(value => {
        if (value.status !== 'executed' && value.status !== 'error') {
          pendingTransactions = pendingTransactions + 1
        }
      })
      return {
        ...state,
        queue: new Map(action.transactions),
        pending: pendingTransactions
      }
    default:
      return state
  }
}

export default transactionsReducer
