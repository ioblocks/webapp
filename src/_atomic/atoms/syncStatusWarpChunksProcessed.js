import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

export default class SyncStatusWarpChunksProcessed extends Component {

  static propTypes = {
    syncStatus: PropTypes.object.isRequired,
  };

  render() {
    const progressWarp = () => {
      try {
        return new BigNumber(this.props.syncStatus.warpChunksProcessed).div(new BigNumber(this.props.syncStatus.warpChunksAmount)).mul(100).toFixed(2)
      } catch (error) {
        return 'n/a'
      }
    }
    const warpChunksProcessed = () => {
      try {
        return new BigNumber(this.props.syncStatus.warpChunksProcessed).toFormat()
      } catch (error) {
        return 'n/a'
      }
    }
    const warpChunksAmount = () => {
      try {
        return new BigNumber(this.props.syncStatus.warpChunksAmount).toFormat()
      } catch (error) {
        return 'n/a'
      }
    }
    return (
    <span>Warp sync {warpChunksProcessed()} of {warpChunksAmount()} ({progressWarp()}%)</span>
    )
  }
}
