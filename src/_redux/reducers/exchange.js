// Copyright 2016-2017 Rigo Investment Sagl.

import initialState from './initialState'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
  UPDATE_TRADE_TOKENS_PAIR,
  CANCEL_SELECTED_ORDER,
  ORDERBOOK_UPDATE,
  ORDERBOOK_INIT,
  ORDERBOOK_AGGREGATE_ORDERS,
  SET_MAKER_ADDRESS,
  TOKEN_PRICE_TICKER_UPDATE,
  UPDATE_ELEMENT_LOADING,
  UPDATE_MARKET_DATA,
  UPDATE_FUND_ORDERS,
  UPDATE_SELECTED_RELAY,
  UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS
} from '../actions/const'



function exchangeReducer(state = initialState.exchange, action) {
  switch (action.type) {

    case UPDATE_FUND_ORDERS:
      return {
        ...state,
        fundOrders: { ...state.fundOrders, ...action.payload }
      };

    case UPDATE_MARKET_DATA:
      return {
        ...state,
        chartData: action.payload
      };

    case UPDATE_ELEMENT_LOADING:
      const elementLoading = action.payload
      return {
        ...state,
        loading: { ...state.loading, ...elementLoading }
      };

    case UPDATE_SELECTED_FUND:
      const fundDetails = action.payload
      return {
        ...state,
        selectedFund: { ...state.selectedFund, ...fundDetails }
      };

    case UPDATE_SELECTED_RELAY:
      const relayDetails = action.payload
      return {
        ...state,
        selectedRelay: { ...state.selectedRelay, ...relayDetails }
      };

    case UPDATE_SELECTED_ORDER:
      var orderDetails = action.payload
      var selectedOrder = { ...state.selectedOrder, ...orderDetails }
      return {
        ...state,
        selectedOrder: selectedOrder
      };

    case UPDATE_TRADE_TOKENS_PAIR:
      return {
        ...state,
        selectedTokensPair: { ...state.selectedTokensPair, ...action.payload }
      };

      case UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS:
      return {
        ...state,
        availableTradeTokensPairs: { ...action.payload }
      };

    case SET_MAKER_ADDRESS:
      return {
        ...state,
        makerAddress: action.payload
      };


    case CANCEL_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: initialState.exchange.selectedOrder
      };

    case ORDERBOOK_AGGREGATE_ORDERS:
      var newOrderBook = { ...state.orderBook, ...{ aggregated: action.payload } }
      return {
        ...state,
        orderBook: newOrderBook
      };

    case ORDERBOOK_INIT:
      newOrderBook = { ...state.orderBook, ...action.payload }
      return {
        ...state,
        orderBook: newOrderBook
      }

    case ORDERBOOK_UPDATE:
      return { ...state, webSocket: { ...action.payload } }

    case TOKEN_PRICE_TICKER_UPDATE:
      var prices = {
        ...action.payload,
        previous: { ...state.prices }
      }
      return { ...state, prices }

    default: return state;
  }
}

export default exchangeReducer