import { APP, DS } from '../_utils/const.js'
import { Link, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import styles from './elements.module.css'

import { Hidden } from 'react-grid-system'
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz'
import Drawer from 'material-ui/Drawer'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import NavigationApp from 'material-ui/svg-icons/navigation/apps'

let drawerStyle = {
  activeLink: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: 'black',
    borderLeftColor: '#054087',
    borderLeftStyle: 'solid',
    borderLeftWidth: '4px',
    borderRadius: '2px'
  }
}
class LeftSideDrawerConfig extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  state = {
    selectedItem: this.props.location.pathname
  }

  buildUrlPath = location => {
    let path = location.pathname.split('/')
    // path.splice(-1,1);
    // var url = path.join('/');
    return path[2]
  }

  setSelectedLink = location => {
    return location.pathname.split('/').pop()
  }

  render() {
    let { location } = this.props
    return (
      <Drawer
        open={true}
        containerClassName={styles.containerleftDrawer}
        className={styles.leftDrawer}
      >
        <Hidden xs sm>
          <Menu
            selectedMenuItemStyle={drawerStyle.activeLink}
            value={this.setSelectedLink(location)}
          >
            <MenuItem
              checked={true}
              primaryText="Application"
              leftIcon={<NavigationApp />}
              containerElement={
                <Link
                  to={
                    DS +
                    APP +
                    DS +
                    this.buildUrlPath(location) +
                    '/config/application'
                  }
                />
              }
              value="application"
            />
            <MenuItem
              checked={true}
              primaryText="Network"
              leftIcon={<ActionSwapHoriz />}
              containerElement={
                <Link
                  to={
                    DS +
                    APP +
                    DS +
                    this.buildUrlPath(location) +
                    '/config/network'
                  }
                />
              }
              value="network"
            />
          </Menu>
        </Hidden>
      </Drawer>
    )
  }
}

export default withRouter(LeftSideDrawerConfig)
