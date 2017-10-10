// Copyright 2016-2017 Gabriele Rigo

import IdentityIcon from '../../IdentityIcon';
import { formatCoins, formatEth, formatHash } from '../../format';

import styles from '../events.css';

import moment from 'moment';
import React, { Component, PropTypes } from 'react';

const EMPTY_COLUMN = (
  <td></td>
);

export default class Event extends Component {
  static contextTypes = {
    accountsInfo: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    event: PropTypes.object,
    value: PropTypes.object,
    price: PropTypes.object,
    dragoname: PropTypes.object,  //check: dragoName??
    cfd: PropTypes.object,
    fromAddress: PropTypes.string,
    toAddress: PropTypes.string
  }

  state = {
    block: null
  }

  componentDidMount () {
    this.loadBlock();
  }

  render () {
    const { event, fromAddress, toAddress, price, value, ethvalue, dragoname, cfd } = this.props;
    const { block } = this.state;
    const { state, type } = event;
    const cls = `${styles.event} ${styles[state]} ${styles[type.toLowerCase()]}`;

    return (
      <tr className={ cls }>
        { this.renderTimestamp(block) }
        { this.renderType(type) }
        { this.renderPrice(price) }
        { this.renderValue(value) }
        { this.renderEthValue(ethvalue) }
        { this.renderAddress(fromAddress) }
        { this.renderAddress(toAddress) }
      </tr>
    );
  }

  /*
  { this.renderName(dragoname) }
  { this.renderAddress(dragoAddress) }
  { this.renderType(id) }
  { this.renderValue(value) }
  { this.renderType(id) }
  */

  renderTimestamp (block) {
    return (
      <td className={ styles.blocknumber }>
        { !block ? ' ' : moment(block.timestamp).fromNow() }
      </td>
    );
  }

  renderAddress (address) {
    if (!address) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.account }>
        <IdentityIcon address={ address } />
        { this.renderAddressName(address) }
      </td>
    );
  }

  renderAddressName (address) {
    const { accountsInfo } = this.context;
    const account = accountsInfo[address];

    if (account && account.name) {
      return (
        <div className={ styles.name }>
          { account.name }
        </div>
      );
    }

    return (
      <div className={ styles.address }>
        { /*formatHash(*/address/*)*/ }
      </div>
    );
  }

  renderPrice (price) {
    if (!price) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.ethvalue }>
        { formatEth(price) }<small> ETH</small>
      </td>
    );
  }

  renderValue (value) {
    if (!value) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.gabvalue }>
        { formatCoins(value) }<small> dETH</small>
      </td>
    );

  }

  renderEthValue (ethvalue) {
    if (!ethvalue) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.ethvalue }>
        { formatEth(ethvalue) }<small> ETH</small>
      </td>
    );
  }

/*
renderName (dragoname) {
  if (!dragoname) {
    return EMPTY_COLUMN;
  }

  return (
    <td className={ styles.name }>
      { dragoname }<small> NAME</small>
    </td>
  );
}
*/

  renderType (type) {
    return (
      <td className={ styles.type }>
        { type }
      </td>
    );
  }

  loadBlock () {
    const { api } = this.context;
    const { event } = this.props;

    if (!event || !event.blockNumber || event.blockNumber.eq(0)) {
      return;
    }

    api.eth
      .getBlockByNumber(event.blockNumber)
      .then((block) => {
        this.setState({ block });
      });
  }
}