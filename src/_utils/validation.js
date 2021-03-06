// Copyright 2016-2017 Rigo Investment Sagl.

import BigNumber from 'bignumber.js'

export const ERRORS = {
  invalidAccount: 'Please select an account to transact with',
  invalidRecipient: 'Please select an account to send to',
  invalidAddress: 'The address is not in the correct format',
  invalidAmount: 'Please enter a positive number > 0',
  invalidAmountFeeTooLow: 'Fee must be equal or greater than 0.01%',
  invalidAmountFeeTooHigh: 'Fee cannot be higher than 1.00%',
  invalidAmountFractionBasisPoint: 'Fee cannot be a fraction of basis point.',
  invalidTotal: 'The amount is greater than the availale balance',
  invalidName: 'Please enter a valid name',
  invalidSymbol: 'Please enter a valid symbol',
  invalidSymbolLeng: 'Symbol has to be 3 chars long',
  invalidSymbolReg: 'Only alphanumeric symbols allowed',
  invalidPrices: 'The BUY price must be greater than the SELL price',
  tradeIdError: 'Please enter a positive number > 0',
  invalidRPCEndpoint: 'Please enter a valid URL',
  exchangeNameError: 'Please select an exchange',
  toAddressError: 'Please entet a valid Ethereum address',
  cfdError: 'Please select an CDF'
}

export function validatePositiveNumber(value) {
  let bn = null

  try {
    bn = new BigNumber(value)
  } catch (e) {}

  if (!bn || !bn.gt(0)) {
    return ERRORS.invalidAmount
  }

  return null
}

export function validateAccount(account, api) {
  if (!account || !account.address) {
    return ERRORS.invalidAccount
  }

  if (!api.utils.isAddress(account.address)) {
    return ERRORS.invalidAddress
  }
  return null
}

export function validateAddress(address, api) {
  if (!api.utils.isAddress(address)) {
    return ERRORS.toAddressError
  }
  return null
}

export function validateNewName(name) {
  // Checking if html in name
  let tmp = document.createElement('DIV')
  tmp.innerHTML = name
  if (!name) {
    return ERRORS.invalidName
  }
  if (name !== tmp.textContent) {
    return ERRORS.invalidName
  }
  return null
}

export function validateNewSymbol(symbol) {
  let reg = /[^A-Za-z0-9 ]/
  if (!symbol) {
    return ERRORS.invalidSymbol
  }
  if (symbol.length !== 3) {
    return ERRORS.invalidSymbolLeng
  }
  if (reg.test(symbol)) {
    return ERRORS.invalidSymbolReg
  }
  return null
}
