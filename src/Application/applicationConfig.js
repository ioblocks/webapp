// Copyright 2016-2017 Rigo Investment Sagl.

import ApplicationConfigHome from '../ApplicationConfig'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TopBarMenu from '../Elements/topBarMenu'

import { Col, Grid, Row } from 'react-flexbox-grid'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import classNames from 'classnames'
import styles from './application.module.css'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#054186'
  },
  fontFamily: "'Muli', sans-serif",
  appBar: {
    height: 45,
    fontSize: '20px !important'
  }
})

function mapStateToProps(state) {
  return state
}

class ApplicationConfigPage extends Component {
  // Context
  static childContextTypes = {
    muiTheme: PropTypes.object
  }

  state = {
    notificationsOpen: false
  }

  getChildContext() {
    return {
      muiTheme
    }
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, value) => {
    const accountType = {
      false: false,
      true: true
    }
    this.setState({
      isManager: accountType[value]
    })
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  }

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    const { location, match } = this.props
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12} className={styles.fix}>
              {/* <ApplicationTabsMenu /> */}
              <TopBarMenu
                handleTopBarSelectAccountType={
                  this.handleTopBarSelectAccountType
                }
                isManager={this.state.isManager}
                transactionsDrawerOpen={this.props.app.transactionsDrawerOpen}
              />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
              <ApplicationConfigHome
                match={match}
                isManager={this.state.isManager}
                location={location}
              />
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationConfigPage)
