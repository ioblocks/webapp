// Copyright 2016-2017 Gabriele Rigo

import * as abis from '../../contracts';
import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.css';

import BigNumber from 'bignumber.js';
import React, { Component, PropTypes } from 'react';

import { Dialog, FlatButton, TextField } from 'material-ui';

const NAME_ID = ' ';
//const MAX_PRICE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export default class ActionBuyDrago extends Component {
  static contextTypes = {
    //instance: PropTypes.object.isRequired
    //drago: PropTypes.object, //contract an instance are defined in this component
    //instance: PropTypes.object //so that they are dynamic and not static
  }

  static propTypes = {
    accounts: PropTypes.array,
    //price: PropTypes.object,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    dragoName: ' ',
    dragoNameError: null,
    dragoSymbol: ' ',
    dragoSymbolError: null,
    instance: ' ',
    instanceError: null, //ERRORS.invalidAccount,
    drago: ' ',
    dragoError: null,
    //dragoAddress: ' ',
    //dragoAddressError: null,  //ERRORS.invalidAccount,
    //maxPrice: api.util.fromWei(this.props.price.mul(1.2)).toFixed(3),
    //maxPriceError: null,
    sending: false,
    complete: false
  }

  render () {
    const { complete } = this.state;

    if (complete) {
      return null;
    }

    return (
      <Dialog
        title='buy dragos for a specific account'
        modal open
        className={ styles.dialog }
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          className={ styles.dlgbtn }
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, amountError, dragoNameError, dragoSymbolError, instance, instanceError, drago, dragoError, sending } = this.state;
    const hasError = !!(this.state.accountError || this.state.amountError || this.state.dragoNameError || this.state.dragoSymbolError || this.state.instanceError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Buy'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const dragoNameLabel ='search your target drago';
    const dragoSymbolLabel ='let us avoid typos!';
    const amountLabel ='how much you want to spend';
    // const maxPriceLabel = `maximum price in ETH (current ${api.util.fromWei(this.props.price).toFormat(3)})`;

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAccounts } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ dragoNameLabel }
          fullWidth
          hintText='the name of the drago you are looking for'
          errorText={ this.state.dragoNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoName } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ dragoSymbolLabel }
          fullWidth
          hintText='the symbol of the drago you are looking for'
          errorText={ this.state.dragoSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoSymbol } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='amount in ETH'
          fullWidth
          hintText={ amountLabel }
          errorText={ this.state.amountError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.amount }
          onChange={ this.onChangeAmount } />
      </div>
    );
  }

  onChangeAccounts = (account) => {
    this.setState({
      account,
      accountError: validateAccount(account)
    }, this.validateTotal);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  onChangeDragoName = (event, dragoName) => {
    this.setState({
      dragoName,
      dragoNameError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onChangeDragoSymbol = (event, dragoSymbol) => {
    this.setState({
      dragoSymbol,
      dragoSymbolError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onFindDragoAddress = () => {
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise.all([
            registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
        ]);
      })
      .then((address) => {
        console.log(`the drago registry was found at ${address}`);

        const dragoRegistry = api.newContract(abis.dragoregistry, address).instance;

        return Promise.all([
            //dragoRegistry.fromName.call({}, ['martinuz'.toString()]) //this function would return
                    //an object with comma separated values and react cannot split [1], the second value
                    // then(([id, dragoAddress, dragoSymbol, dragoID, dragoOwner, dragoGroup]) => {})
                    //https://www.npmjs.com/package/comma-separated-values might help for getting groups
                    //for now implemented in solidity and added extra security as performs symbol check!
            //dragoRegistry.fromNameSymbol.call({}, ['firstdrago'.toString(), 'fst'.toString()])
            dragoRegistry.fromNameSymbol.call({}, [this.state.dragoName.toString(), this.state.dragoSymbol.toString()])
        ])
        .then((dragoAddress) => {

          console.log(`length of object array ${dragoAddress.length}`)

          const drago = api.newContract(abis.drago, dragoAddress);

          this.setState({
            //dragoAddress,
            drago,
            instance : drago.instance
          })

          console.log(`your target drago was found at ${dragoAddress}`);
        });
      });
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, dragoName, dragoNameError, dragoSymbolError, instance, instanceError } = this.state;

    if (accountError || amountError || dragoNameError || dragoSymbolError || instanceError) {
      return;
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {

    //const { instance } = this.context;
    const instance = this.state.instance;

    //const dragoAddress = this.state.dragoAddress.toString();
    // const maxPrice = api.util.toWei(this.state.maxPrice);
    //const values = [this.state.account.address, dragoAddress];
    //const dragoAddress = api.util.toChecksumAddress(this.state.dragoAddress);
    const values = []; // [this.state.dragoAddress];
    const options = {
      from: this.state.account.address,
      value: api.util.toWei(this.state.amount).toString()
    };

    this.setState({
      sending: true
    });

    instance.buyDrago
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas =  gasEstimate.mul(1.2).toFixed(0); //problem with estimate cause of blank before dragoAddress
        console.log(`buy drago: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.buyDrago.postTransaction(options, values);
      })
      .then(() => {
        this.props.onClose();
        this.setState({
          sending: false,
          complete: true
        });
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        });
      });
  }
}