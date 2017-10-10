// Copyright 2016 Gavin Wood

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventTransfer extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { from, to, _amount } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ from }
        toAddress={ to }
        value={ _amount } />
    );
  }
}

//event transfer of tokens from/to minter has to be ported to dragoFactory to be visible