// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component} from 'react';
import PropTypes from 'prop-types';
// import BigNumber from 'bignumber.js';

export default class TokenIcon extends Component {

  static propTypes = {
    symbol: PropTypes.string.isRequired,
    size: PropTypes.number,
    color: PropTypes.bool
  }

  static defaultProps = {
    size: 32,
    color: true
  }
  render () {
    return (
      <img style={{verticalAlign: "middle"}} height={""+this.props.size+"px"} alt="token-icon" src={"/img/crypto-icons/color/"+this.props.symbol+"@2x.png"} />
    );
  }
}