import { ENDPOINTS } from './utils/const'
import { Observable, timer } from 'rxjs'
import {
  catchError,
  delay,
  exhaustMap,
  map,
  retryWhen,
  share,
  switchMap,
  tap,
  timeout
} from 'rxjs/operators'
import Web3 from 'web3'
import Web3WsProvider from './utils/web3-providers-ws/src'
import contract from './utils/contract'
import exchangeEfxV0$ from './observables/exchangeEfx'
import getEventful$ from './observables/eventful'
import newBlock from './observables/newBlock'
import nodeStatus$ from './observables/nodeStatus'

const defaultStatus = {
  isConnected: false,
  isSyncing: false,
  syncStatus: {},
  error: {}
}
class Web3Wrapper {
  web3 = null
  instance = null
  status$ = timer(0, 2000).pipe(
    exhaustMap(() =>
      Observable.create(async observer => {
        try {
          const status = await this.web3.eth.isSyncing()
          const nodeStatus = status
            ? { ...defaultStatus, isConnected: true, isSyncing: true }
            : { ...defaultStatus, isConnected: true }

          observer.next(nodeStatus)
          observer.complete()
        } catch (e) {
          observer.next({ ...defaultStatus, error: e })
          return observer.error(e)
        }
        return () => observer.complete()
      })
    ),
    share()
  )

  init(networkId, protocol = 'wss', timeoutMs = 5 * 1000) {
    const transport = ENDPOINTS[protocol][networkId].prod
    const provider = new Web3.providers.WebsocketProvider(transport)
    const wsProvider = new Web3WsProvider(transport)
    const reconnectingWsProvider = () => new Web3WsProvider(transport)
    // console.log(provider)
    // console.log(wsProvider)

    this.web3 = new Web3(reconnectingWsProvider())
    this.status$
      .pipe(
        timeout(timeoutMs),
        retryWhen(errors => {
          return errors.pipe(
            tap(() =>
              console.error('Websocket disconnected. Setting new provider...')
            ),
            map(() => {
              // this.web3.setProvider(
              //   new Web3.providers.WebsocketProvider(transport)
              // )
              // this.web3.setProvider(reconnectingWsProvider())
            }),
            delay(5000)
          )
        })
      )
      .subscribe()

    return Object.assign(this.web3, {
      rigoblock: {
        ob: {
          eventful$: getEventful$(this.web3, networkId),
          exchangeEfxV0$: exchangeEfxV0$(this.web3, networkId),
          nodeStatus$: nodeStatus$(this.status$),
          newBlock$: newBlock(this.web3)
        },
        utils: { contract: contract(this.web3) },
        endpoint: transport
      }
    })
  }

  getInstance = (networkId, protocol) => {
    if (!this.instance) {
      this.instance = this.init(networkId, protocol)
    }
    return this.instance
  }
}

export default new Web3Wrapper()