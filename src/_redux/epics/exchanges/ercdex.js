// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/dom/webSocket'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/bufferTime'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/reduce'
import 'rxjs/add/operator/retryWhen'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/observable/fromEvent'
import 'rxjs/observable/timer'
import { Observable } from 'rxjs'
import {
  bufferCount,
  bufferTime,
  filter,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
// import { timer } from 'rxjs/observable/timer'
import 'rxjs/add/observable/forkJoin'
import { zip } from 'rxjs/observable/zip'
import Exchange from '../../../_utils/exchange/src/index'
import utils from '../../../_utils/utils'

import {
  formatOrders,
  getHistoricalPricesDataFromERCdEX,
  getOrdersFromRelayERCdEX
} from '../../../_utils/exchange'

import { ERCdEX } from '../../../_utils/const'

import {
  CHART_MARKET_DATA_UPDATE,
  FETCH_ACCOUNT_ORDERS_START,
  FETCH_ASSETS_PRICE_DATA,
  FETCH_CANDLES_DATA_SINGLE_START,
  FETCH_CANDLES_DATA_SINGLE_STOP,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_GET_ORDERS,
  RELAY_MSG_FROM_WEBSOCKET,
  RELAY_OPEN_WEBSOCKET_TICKER,
  UPDATE_CURRENT_TOKEN_PRICE,
  UPDATE_ELEMENT_LOADING,
  UPDATE_FUND_ORDERS,
  UPDATE_SELECTED_DRAGO_DETAILS
} from '../../../_redux/actions/const'

//
// CONNECTING TO WS AND GETTING UPDATES FROM RELAY ERCdEX
//

// https://github.com/ReactiveX/rxjs/issues/2048

const customRelayAction = action => {
  return `${ERCdEX}_${action}`
}

const reconnectingWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    // const relay = {
    //   name: 'Ethfinex'
    // }
    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getTicker(
      utils.getTokenSymbolForRelay(relay.name, baseToken),
      utils.getTokenSymbolForRelay(relay.name, quoteToken)
    )
    websocket.onmessage = msg => {


      return observer.next(msg.data)
    }
    websocket.onclose = msg => {
      // websocket.send(`unsub:ticker`);

      // return msg.wasClean ? observer.complete() : null
    }
    websocket.onerror = error => {


      // return observer.error(error)
    }
    return () => websocket.close()
  })
}

export const initRelayWebSocketTickerEpic = action$ => {
  return action$.pipe(
    ofType(customRelayAction(RELAY_OPEN_WEBSOCKET_TICKER)),
    mergeMap(action => {
      return reconnectingWebsocket$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken
      ).pipe(
        takeUntil(
          action$.pipe(
            ofType(RELAY_CLOSE_WEBSOCKET),
            filter(closeAction => closeAction.ticker === action.ticker)
          )
        ),
        tap(() => {}),
        map(payload => ({
          type: customRelayAction(RELAY_MSG_FROM_WEBSOCKET),
          payload
        }))
      )
    })
  )
}

const updateCurrentTokenPrice = (tickerOutput, baseToken) => {
  let ticker = JSON.parse(tickerOutput)
  if (ticker.channel === 'ticker') {
    const arrayToObject = (ticker, keyField) =>
      Object.assign(
        {},
        ...ticker.data.tickers.map(item => ({ [item[keyField]]: item }))
      )
    const tokenList = arrayToObject(ticker, 'symbol')
    let current = {
      price: tokenList[baseToken.symbol].priceEth
    }
    return {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
        current
      }
    }
  } else {
    return {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {}
    }
  }
}

export const orderBookEpic = (action$, state$) => {
  return action$.pipe(
    ofType(customRelayAction(RELAY_MSG_FROM_WEBSOCKET)),
    map(action => action.payload),
    bufferTime(1000),
    filter(value => {
      return value.length !== 0
    }),
    bufferCount(1),
    map(ticker => {

      const currentState = state$.value
      const lastItem = ticker[0].pop()
      return [lastItem, currentState]
    }),
    tap(val => {

      return val
    }),
    switchMap(ticker =>
      Observable.of(
        {
          type: RELAY_GET_ORDERS,
          payload: {
            relay: ticker[1].exchange.selectedRelay,
            networkId: '42',
            baseToken: ticker[1].exchange.selectedTokensPair.baseToken,
            quoteToken: ticker[1].exchange.selectedTokensPair.quoteToken,
            aggregated: ticker[1].exchange.orderBookAggregated
          }
        },
        updateCurrentTokenPrice(
          ticker[0],
          ticker[1].exchange.selectedTokensPair.baseToken
        )
      )
    )
  )
}

//
// FETCH HISTORICAL MARKET DATA
//

const getCandlesData$ = (
  relay,
  networkId,
  baseToken,
  quoteToken,
  startDate
) => {
  // const relay = {
  //   name: 'ERCdEX'
  // }
  const exchange = new Exchange(relay.name, networkId)
  return Observable.fromPromise(
    exchange.getHistoricalPricesData(
      utils.getTokenSymbolForRelay(relay.name, baseToken),
      utils.getTokenSymbolForRelay(relay.name, quoteToken),
      startDate
    )
  )
}

// const getHistoricalPricesData$ = (networkId, baseToken, quoteToken, startDate) =>
//   Observable.fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseToken.address, quoteToken.address, startDate))

export const getCandlesSingleDataEpic = action$ => {
  return action$.pipe(
    ofType(customRelayAction(FETCH_CANDLES_DATA_SINGLE_START)),
    takeUntil(
      action$.ofType(customRelayAction(FETCH_CANDLES_DATA_SINGLE_STOP))
    ),
    mergeMap(action => {

      return Observable.concat(
        Observable.of({
          type: UPDATE_ELEMENT_LOADING,
          payload: { marketBox: true }
        }),
        getCandlesData$(
          action.payload.selectedRelay,
          action.payload.networkId,
          action.payload.baseToken,
          action.payload.quoteToken,
          action.payload.startDate
        ).pipe(
          map(historical => {
            return {
              type: CHART_MARKET_DATA_UPDATE,
              payload: historical
            }
          })
        ),
        Observable.of({
          type: UPDATE_ELEMENT_LOADING,
          payload: { marketBox: false }
        })
      )
    })
  )
}

//
// FETCH OPEN ORDERS
//

const getAccountOrdersFromRelay$ = (
  networkId,
  maker,
  baseTokenAddress,
  quoteTokenAddress
) =>
  Observable.fromPromise(
    getOrdersFromRelayERCdEX(
      networkId,
      maker,
      baseTokenAddress,
      quoteTokenAddress
    )
  )

export const getAccountOrdersEpic = action$ => {
  return action$
    .ofType(customRelayAction(FETCH_ACCOUNT_ORDERS_START))
    .mergeMap(action => {
      return Observable.concat(
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true }}),
        zip(
          getAccountOrdersFromRelay$(
            action.payload.networkId,
            action.payload.maker,
            action.payload.baseTokenAddress,
            action.payload.quoteTokenAddress
          ).map(orders => {

            return formatOrders(orders, 'asks')
          }),
          getAccountOrdersFromRelay$(
            action.payload.networkId,
            action.payload.maker,
            action.payload.quoteTokenAddress,
            action.payload.baseTokenAddress
          ).map(orders => {
            return formatOrders(orders, 'bids')
          })
        ).map(orders => {

          return {
            type: UPDATE_FUND_ORDERS,
            payload: {
              open: orders[0].concat(orders[1])
            }
          }
        })
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false }}),
      )
    })
}

//
// FETCH ASSETS PRICES DATA
//

const getAssetsPricesDataFromERCdEX$ = (
  networkId,
  symbol,
  baseTokenAddress,
  quoteTokenAddress,
  startDate
) =>
  Observable.fromPromise(
    getHistoricalPricesDataFromERCdEX(
      networkId,
      baseTokenAddress,
      quoteTokenAddress,
      startDate
    )
  )
    .map(result => {
      const data = {
        symbol: symbol,
        startDate,
        data: result.map(entry => {
          const date = new Date(entry.date)
          entry.date = date
          return entry
        }),
        error: ''
      }
      return data
    })
    .catch(error => {
      const data = {
        symbol: symbol,
        startDate,
        data: [],
        error
      }
      return Observable.of(data)
    })

export const getAssetsPricesDataFromERCdEXEpic = action$ => {
  return action$.ofType(FETCH_ASSETS_PRICE_DATA).mergeMap(action => {
    const observableArray = () => {
      const observableArray = Array(0)
      for (let property in action.payload.assets) {
        if (action.payload.assets.hasOwnProperty(property)) {
          // console.log(action.payload.assets[property])
          observableArray.push(
            getAssetsPricesDataFromERCdEX$(
              action.payload.networkId,
              action.payload.assets[property].symbol,
              action.payload.assets[property].address,
              action.payload.quoteToken,
              new Date(
                (Math.floor(Date.now() / 1000) - 86400 * 7) * 1000
              ).toISOString()
            )
          )
        }
      }
      return observableArray
    }
    return Observable.forkJoin(observableArray()).map(result => {
      const arrayToObject = (arr, keyField) =>
        Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))
      const assetsCharts = arrayToObject(result, 'symbol')
      return {
        type: UPDATE_SELECTED_DRAGO_DETAILS,
        payload: {
          assetsCharts
        }
      }
    })
  })
}
