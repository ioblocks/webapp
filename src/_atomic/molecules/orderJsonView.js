import { Card, CardHeader, CardText } from 'material-ui/Card'
import JsonView from '../atoms/jsonView'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import styles from './orderJsonView.module.css'
import utils from '../../_utils/utils'

class OrderJsonView extends Component {
  static propTypes = {
    orderJson: PropTypes.object
  }

  static defaultProps = {
    orderJson: {}
  }

  shouldComponentUpdate(nextProps) {
    let propsUpdate = utils.shallowEqual(this.props, nextProps)
    return propsUpdate
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="Check and confirm your order."
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText expandable={true}>
          <div className={styles.orderContainer}>
            <JsonView orderJson={this.props.orderJson} />
          </div>
        </CardText>
      </Card>
    )
  }
}

export default OrderJsonView
