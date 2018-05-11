import Chip from 'material-ui/Chip'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar'

import styles from './chipTokenETH.module.css'

class ChipTokenETH extends Component {

  static propTypes = {
    account: PropTypes.object.isRequired,
  };

  render() {
    const { account } = this.props;
    return (
      <Chip style={{ border: "1px solid", borderColor: "#E0E0E0", padding: "1px" }}
      backgroundColor="#FFFFFF">
      <Avatar src="img/ethereum-black-64x64.png" style={{border: "1px solid"}} backgroundColor="#E0E0E0"/>
      {account.ethBalance} <span className={styles.tokensSymbolText}>ETH</span>
    </Chip>
    )
  }
}

export default ChipTokenETH