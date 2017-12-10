// Copyright 2016-2017 Gabriele Rigo

import React, { Component } from 'react';
import * as abis from '../contracts';
import ReactDOM from 'react-dom'


import Accounts from '../Accounts';
import ApplicationDragoTrader from './ApplicationDragoTrader'
import ApplicationDragoManager from './ApplicationDragoManager'
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoHome.module.css';
import BigNumber from 'bignumber.js';

import { Grid, Row, Col } from 'react-flexbox-grid';
import LeftSideDrawer from '../elements/leftSideDrawer';
import PropTypes from 'prop-types';
import utils from '../utils/utils'
import NotificationSystem from 'react-notification-system'
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import ElementNotification from './Elements/elementNotification'
import ElementNotificationsDrawer from './Elements/elementNotificationsDrawer'


const DIVISOR = 10 ** 6;  //tokens are divisible by one million

export default class ApplicationDragoHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
  }

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.func.isRequired
  };

  static childContextTypes = {
    contract: PropTypes.object
  };
  
  getChildContext () {   
    const {contract} = this.state 
    return {
      contract,
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    isManager: PropTypes.bool.isRequired, 
    notificationsOpen: PropTypes.bool.isRequired
  };

  state = {
    accounts: [],
    accountsInfo: null,
    // blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    loading: true,
    subscriptionIDDrago: null,
    subscriptionIDContractDrago: null,
    contract: null,
    instance: null,
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
  }

  scrollPosition = 0

  shouldComponentUpdate(nextProps, nextState){
    // WE NEED TO LOOK INTO THIS FUNCTION. 
    //
    // After a change in the accounts balances:
    // this.state.accounts and nextState.accounts are the same. They should not.
    // this.state.ethBalance and nextState.ethBalance are different, thus behaving correctly.
    //
    // It might have something to do with immutability in React


    // Checking if the total accounts balance has changed.
    // If positive a render is trigged so that the childrens are aware that something has changed.
    const  sourceLogClass = this.constructor.name
    // console.log(`${sourceLogClass} -> shouldComponentUpdate`);
    // console.log(nextState.ethBalance.toFormat())
    // console.log(this.state.ethBalance.toFormat())
    const accountsUpdate = !this.state.ethBalance.eq(nextState.ethBalance)
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    // console.log(this.state.accounts.length)
    // if (this.state.accounts.length > 0) {
    //   console.log(this.state.accounts[0].ethBalance)
    //   console.log(nextState.accounts[0].ethBalance)
    // }
    // console.log(this.state.accounts[0])
    // console.log(nextState.accounts[0])
    // console.log (`${sourceLogClass} -> Received new props. Need update? ${accountsUpdate || propsUpdate}`);


    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = ReactDOM.findDOMNode(this);
    if (element != null) {
      this.scrollPosition = window.scrollY
    }
    // Returning false if no need to update children, true if needed.
    return accountsUpdate || propsUpdate
  }

  componentWillMount () {
    this.attachInterface();
  } 

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  componentWillUpdate() {
  }

  componentDidUpdate(prevProps, prevState) {
    // Setting the page scroll position
    var sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} -> componentDidUpdate`);
    const element = ReactDOM.findDOMNode(this);
    if (element != null) {
      window.scrollTo(0, this.scrollPosition)
    }
  }

  render () {
    const { ethBalance, loading, blockNumber, accounts, allEvents, accountsInfo  } = this.state;
    const {isManager, location, handleToggleNotifications, notificationsOpen}  = this.props

    if (loading) {
      return null
    }

    if (isManager) {

      var notificationStyle = {
        NotificationItem: { // Override the notification item
          DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '0px 0px 0px 0px'
          },
      
          info: { // Applied only to the success notification item
            backgroundColor: 'white'
          }
        }
      }
      return (
        <Row className={styles.maincontainer}>
          <Col xs={2}>
            <LeftSideDrawer location={location}/>
          </Col>
          <Col xs={10}>
            <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle}/>
            <ApplicationDragoManager 
              blockNumber={blockNumber}
              accounts={accounts}
              ethBalance={ethBalance}
              allEvents={allEvents}
              accountsInfo={accountsInfo}
            />
          </Col>
          <Row>
            <Col xs>
              <ElementNotificationsDrawer 
                handleToggleNotifications={handleToggleNotifications} 
                notificationsOpen={notificationsOpen}
                accounts={accounts}
                events={allEvents}
                />
            </Col>
          </Row>
        </Row>
      );
    }

    if (!isManager) {

      var notificationStyle = {
        NotificationItem: { // Override the notification item
          DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '0px 0px 0px 0px'
          },
      
          info: { // Applied only to the success notification item
            backgroundColor: 'white'
          }
        }
      }
      return (
        <span>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawer location={location}/>
            </Col>
            <Col xs={10}>
              <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle}/>
              <ApplicationDragoTrader 
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo}
              />
            </Col>
          </Row>
            <Row>
            <Col xs>
              <ElementNotificationsDrawer 
                handleToggleNotifications={handleToggleNotifications} 
                notificationsOpen={notificationsOpen}
                accounts={accounts}
                events={allEvents}
                />
            </Col>
          </Row>
        </span>
      );
    }
  }

  notificationAlert = (primaryText, secondaryText, eventType = 'transfer') => {

    return (
      <ElementNotification 
        primaryText={primaryText}
        secondaryText={secondaryText}
        eventType={eventType}
        />
    )
  }

  onNewBlockNumber = (_error, blockNumber) => {
    // const accounts = this.state.accounts
    // const accounts = Object.assign({}, this.state.accounts);
    const accounts = [].concat(this.state.accounts);
    const { api } = this.context;
    if (_error) {
      console.error('onNewBlockNumber', _error)
      return
    }
    const sourceLogClass = this.constructor.name
    const ethQueries = accounts.map((account) => {
      console.log(`${sourceLogClass} API call getBalance -> applicationDragoHome: Getting balance of account ${account.name}`)
      return api.eth.getBalance(account.address)
      .catch(error => {
        console.warn('super error')
      })
    })
    Promise
      .all(ethQueries)
      .then((ethBalances) => {
        const prevAccounts = [].concat(this.state.accounts)
        prevAccounts.map((account,index) =>{
          const newBalance = api.util.fromWei(ethBalances[index]).toFormat(3)
          if (account.ethBalance !== newBalance) {
            console.log(`${account.name} balance changed`)
            var eventType = 'balanceChange'
            var secondaryText = ''
            var balDifference = account.ethBalance - newBalance
            console.log(balDifference)
            if (balDifference > 0) {
              secondaryText = `You transferred ${balDifference.toFixed(4)} ETH!`
            } else {
              secondaryText = `You received ${Math.abs(balDifference).toFixed(4)} ETH!`
            }
            if (this._notificationSystem) {
              console.log('notification fired')
              this._notificationSystem.addNotification({
                  level: 'info',
                  position: 'br',
                  children: this.notificationAlert(account.name, secondaryText)
              });
            }
          }

        })
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, index) => {
            const ethBalance = ethBalances[index];
            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            return account;
          })
        })
      })
      .catch((error) => {
        console.warn('onNewBlockNumber', error);
      });
  }

  getAccountsParity () {
    const { api } = this.context;
    return api.parity
      .accountsInfo()
      .catch((error) => {
        console.warn('getAccounts', error);
        return api.parity
          .accounts()
          .then((accountsInfo) => {
            return Object
              .keys(accountsInfo)
              .filter((address) => accountsInfo[address].uuid)
              .reduce((ret, address) => {
                ret[address] = {
                  name: accountsInfo[address].name
                };
                return ret;
              }, {});
          });
      })
      .then((accountsInfo) => {
        console.log('Parity getAccounts', accountsInfo)
        Object.keys(accountsInfo).forEach(function(k) {
          accountsInfo[k] = {
            name: accountsInfo[k].name,
            source: "parity"
          }
        })
        return accountsInfo
      });
  }

  getAccountsMetamask () {
    const web3 = window.web3
    if (typeof web3 === 'undefined') {
      return
    }
    // const balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]))
    return web3.eth.getAccounts()
      .then(accounts => {
        
        const balance = web3.eth.getBalance(accounts[0])
        .then(balance => {
          return balance
        })
        const accountsMetaMask = {
          [accounts[0]]: {
            name: "MetaMask",
            source: "MetaMask"
          }
        }

        return accountsMetaMask
      })
      .catch(() =>{
        return
      })
  }

  attachInterface = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    this.getAccountsMetamask()
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`${sourceLogClass} -> The Registry was found at ${registryAddress}`);
        const registry = api.newContract(abis.registry, registryAddress).instance;
        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('eventful'), 'A']),
            this.getAccountsParity(),
            this.getAccountsMetamask()
          ]);
      })
      .then(([address, accountsInfo, accountsMetaMask]) => {
        console.log(`${sourceLogClass} -> Drago Eventful was found at ${address}`);
        const contract = api.newContract(abis.eventful, address);
        const allAccounts = {...accountsInfo, ...accountsMetaMask}
        this.setState({
          accountsInfo,
          loading: false,
          contract: contract,
          instance: contract.instance,
          accounts: Object
            .keys(allAccounts)
            .map((address) => {
              const info = allAccounts[address] || {};
              return {
                address,
                name: info.name,
                source: info.source,
                ethBalance: "0"
              };
            })
        });
        api.subscribe('eth_blockNumber', this.onNewBlockNumber)
        .then((subscriptionID) => {
          console.log(`applicationDragoHome: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
          this.setState({subscriptionIDDrago: subscriptionID});
        })
        .catch((error) => {
          console.warn('error subscription', error)
        });
        return contract
      })
      .catch((error) => {
        console.warn('attachInterface', error)
      });
  }


  detachInterface = () => {
    const { subscriptionIDDrago, contract, subscriptionIDContractDrago } = this.state;
    const { api } = this.context;
    console.log(`applicationDragoHome: Unsubscribed to eth_blockNumber -> Subscription ID: ${subscriptionIDDrago}`);
    api.unsubscribe(subscriptionIDDrago).catch((error) => {
      console.warn('Unsubscribe error', error);
    });
  } 
}
