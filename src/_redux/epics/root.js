// Copyright 2016-2017 Rigo Investment Sarl.

import { combineEpics } from 'redux-observable';
// import pingEpic from './ping';
import { 
  relayWebSocketEpic, 
  orderBookEpic,
  initOrderBookFromRelayERCDexEpic,
  updateFundLiquidityEpic,
  getHistoricalFromERCDexEpic
} from './exchange'
import { setTokenAllowanceEpic,
  getPricesERCdEXEpic
} from './token'

export const rootEpic = combineEpics (
  // pingEpic,
  relayWebSocketEpic,
  orderBookEpic,
  setTokenAllowanceEpic,
  initOrderBookFromRelayERCDexEpic,
  getPricesERCdEXEpic,
  updateFundLiquidityEpic,
  getHistoricalFromERCDexEpic
);