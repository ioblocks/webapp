import { BigNumber } from 'bignumber.js'
import { ERCdEX, Ethfinex } from './const'
import { ZeroEx } from '0x.js'
import Web3 from 'web3'
import moment from 'moment'

const formatOrdersFromAggregateERCdEX = orders => {
  let orderPrice, orderAmount
  let web3 = new Web3(Web3.currentProvider)
  let formattedOrders = orders.map(order => {
    orderPrice = new BigNumber(order.price).toFixed(7)
    orderAmount = new BigNumber(
      web3.utils.fromWei(Web3.utils.toBN(order.volume))
    ).toFixed(5)
    let orderObject = {
      orderAmount,
      orderPrice
    }
    return orderObject
  })
  return formattedOrders
}

export const formatOrdersFromERCdEX = (orders, orderType) => {
  let orderPrice, orderAmount
  let web3 = new Web3(Web3.currentProvider)
  let formattedOrders = orders.map(order => {
    switch (orderType) {
      case 'asks':
        orderPrice = new BigNumber(order.takerTokenAmount)
          .div(new BigNumber(order.makerTokenAmount))
          .toFixed(7)
        orderAmount = new BigNumber(
          web3.utils.fromWei(Web3.utils.toBN(order.makerTokenAmount), 'ether')
        ).toFixed(5)
        break
      case 'bids':
        orderPrice = new BigNumber(1)
          .div(
            new BigNumber(order.takerTokenAmount).div(
              new BigNumber(order.makerTokenAmount)
            )
          )
          .toFixed(7)
        orderAmount = new BigNumber(
          web3.utils.fromWei(Web3.utils.toBN(order.takerTokenAmount), 'ether')
        ).toFixed(5)
        break
      default:
        return null
    }
    let orderHash = ZeroEx.getOrderHashHex(order)
    let orderObject = {
      order,
      orderAmount,
      orderType,
      orderPrice,
      orderHash
    }
    return orderObject
  })
  return formattedOrders
}

const formatOrdersFromAggregateEthfinex = orders => {
  let orderPrice, orderAmount
  let formattedOrders = orders.map(order => {
    orderPrice = new BigNumber(order[0]).toFixed(7)
    orderAmount = new BigNumber(order[2]).abs().toFixed(5)
    let orderObject = {
      orderAmount,
      orderPrice
    }
    return orderObject
  })
  return formattedOrders
}

const calculateSpread = (asksOrders, bidsOrders) => {
  let spread = 0
  if (bidsOrders.length !== 0 && asksOrders.length !== 0) {
    spread = new BigNumber(asksOrders[asksOrders.length - 1].orderPrice)
      .minus(new BigNumber(bidsOrders[0].orderPrice))
      .toFixed(6)
  } else {
    spread = new BigNumber(0).toFixed(6)
  }
  return spread
}

export const tickers = {
  [ERCdEX]: tickers => {
    let tickersList = []
    tickers.forEach(ticker => {
      if (ticker.quoteTokenSymbol === 'WETH') {
        tickersList.push({
          priceEth: ticker.last,
          priceUsd: null,
          symbol: ticker.baseTokenSymbol
        })
      }
    })
    tickersList.push({
      priceEth: 1,
      priceUsd: null,
      symbol: 'WETH'
    })
    return tickersList
  },
  [Ethfinex]: tickers => {
    let tickersList = tickers.map(ticker => {
      return {
        priceEth: ticker[7].toString(),
        priceUsd: '',
        symbol: ticker[0].substr(1, 3)
      }
    })
    tickersList.push({
      priceEth: '1',
      priceUsd: '',
      symbol: 'WETH'
    })
    tickersList.push({
      priceEth: '1',
      priceUsd: '',
      symbol: 'ETH'
    })
    return tickersList
  }
}

export const aggregatedOrders = {
  [ERCdEX]: orders => {
    const bidsOrders = formatOrdersFromAggregateERCdEX(
      orders.buys.priceLevels,
      'bids'
    )
    const asksOrders = formatOrdersFromAggregateERCdEX(
      orders.sells.priceLevels,
      'asks'
    )
    const spread = calculateSpread(asksOrders, bidsOrders)
    return {
      bids: bidsOrders,
      asks: asksOrders,
      spread
      // aggregated: true
    }
  },
  [Ethfinex]: orders => {
    let bids = new Array(0)
    let asks = new Array(0)
    orders.forEach(order => {
      order[2] > 0 ? bids.push(order) : asks.push(order)
    })
    const bidsOrders = formatOrdersFromAggregateEthfinex(bids, 'bids')
    const asksOrders = formatOrdersFromAggregateEthfinex(asks.reverse(), 'asks')
    // console.log(bidsOrders)
    // console.log(asksOrders)
    const spread = calculateSpread(asksOrders, bidsOrders)
    return {
      bids: bidsOrders,
      asks: asksOrders,
      spread
      // aggregated: true
    }
  }
}

export const orders = {
  [ERCdEX]: orders => {
    const bidsOrders = formatOrdersFromERCdEX(orders.bids, 'bids')
    const asksOrders = formatOrdersFromERCdEX(orders.asks, 'asks')
    const spread = calculateSpread(asksOrders, bidsOrders)
    return {
      bids: bidsOrders,
      asks: asksOrders,
      spread
      // aggregated: false
    }
  },
  [Ethfinex]: orders => {
    let bids = new Array(0)
    let asks = new Array(0)
    orders.forEach(order => {
      order[2] > 0 ? bids.push(order) : asks.push(order)
    })
    const bidsOrders = formatOrdersFromAggregateEthfinex(bids, 'bids')
    const asksOrders = formatOrdersFromAggregateEthfinex(asks.reverse(), 'asks')
    // console.log(bidsOrders)
    // console.log(asksOrders)
    const spread = calculateSpread(asksOrders, bidsOrders)
    return {
      bids: bidsOrders,
      asks: asksOrders,
      spread,
      aggregated: true
    }
  }
}

export const accountOrders = {
  // [ERCdEX]: (orders) => {
  //   const bidsOrders = formatOrdersFromERCdEX(orders.bids, 'bids')
  //   const asksOrders = formatOrdersFromERCdEX(orders.asks, 'asks')
  //   const spread = calculateSpread(asksOrders, bidsOrders)
  //   return {
  //     bids: bidsOrders,
  //     asks: asksOrders,
  //     spread,
  //     // aggregated: false
  //   }
  // },
  [Ethfinex]: orders => {
    let orderPrice, orderAmount, remainingAmount
    let formattedOrders = orders.map(order => {
      let orderType = order.amount > 0 ? 'bids' : 'asks'
      orderPrice = new BigNumber(order.price).toFixed(7)
      orderAmount = new BigNumber(order.amount).toFixed(5)
      remainingAmount = new BigNumber(order.amount).toFixed(5)
      let date = moment(order.created_at)
      let yesterday = moment()
        .subtract(1, 'days')
        .endOf('day')
      let orderObject = {
        order,
        dateCreated: date.isAfter(yesterday)
          ? date.format('h:mm:ss')
          : date.format('YYYY-MM-DD'),
        orderAmount,
        remainingAmount,
        orderType,
        orderPrice,
        active: order.active
      }

      return orderObject
    })
    return formattedOrders
  }
}

export const historicalPricesData = {
  [ERCdEX]: historical => {
    // return historical
    return historical.map(entry => {
      const date = new Date(entry.date)
      entry.date = date
      return entry
    })
  }
  // [Ethfinex]: (orders) => {
  //   var bids = new Array()
  //   var asks = new Array()
  //   orders.map(order => {
  //     (order[2] > 0) ? bids.push(order) : asks.push(order)
  //   })
  //   const bidsOrders = formatOrdersFromAggregateEthfinex(bids, 'bids')
  //   const asksOrders = formatOrdersFromAggregateEthfinex(asks.reverse(), 'asks')
  //   // console.log(bidsOrders)
  //   // console.log(asksOrders)
  //   const spread = calculateSpread(asksOrders, bidsOrders)
  //   return {
  //     bids: bidsOrders,
  //     asks: asksOrders,
  //     spread,
  //     aggregated: true
  //   }
  // },
}
