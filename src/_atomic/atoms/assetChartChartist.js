import Chartist from 'chartist'
import ChartistGraph from 'react-chartist'
import React, { Component } from 'react'
// import dataSerie from './dataSerie.json'
// import dataSerie2 from './dataSerie2.json'
import './assetChartChartis.module.css'
// import 'chartist/dist/chartist.min.css'
import PropTypes from 'prop-types'
import moment from 'moment'
// import styles from './assetChartChartis.module.css'

class AssetChartChartist extends Component {
  // static propTypes = {
  //   data: PropTypes.array.isRequired
  // }

  shouldComponentUpdate = () => {
    return false
  }

  mapData = arr => {
    return arr.map(el => {
      console.log(el)
      return {
        x: new Date(el.date),
        y: el.close
      }
    })
  }
  getHour = (dayOffset, hourOffset) =>
    parseInt(
      moment()
        .startOf('day')
        .add(dayOffset, 'days')
        .add(hourOffset, 'hours')
        .format('x')
    )

  getTicks = () => {
    const oneDayAgo = moment()
      .startOf('hour')
      .subtract(24, 'hours')
      .format('x')
    // calculating timestamps for yesterday and today
    const ticks = [
      this.getHour(-1, 0), // 00:00
      this.getHour(-1, 6), // 06:00
      this.getHour(-1, 12), // 12:00
      this.getHour(-1, 18), // 18:00
      this.getHour(0, 0), // 00:00
      this.getHour(0, 6), // 06:00
      this.getHour(0, 12), // 12:00
      this.getHour(0, 18) // 18:00
    ]
    // return only the tickers relevant to the last 24 hours
    return ticks.filter(tick => tick >= oneDayAgo)
  }
  render() {
    const dataSerie = this.props.data
    const type = 'Line'
    let options = {
      axisY: {
        showGrid: false, // removes the grid
        // labelOffset: {
        //   x: 10
        // }
        showLabel: false // removes the Y label
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        low: parseInt(
          moment()
            .startOf('hour')
            .subtract(24, 'hours')
            .format('x')
        ),
        high: parseInt(
          moment()
            .startOf('hour')
            .format('x')
        ),
        ticks: this.getTicks(),
        labelInterpolationFnc: value => moment(value).format('HH:mm'),
        showGrid: false,
        labelOffset: {
          x: -20
        }
      },
      showPoint: false,
      showArea: true,
      lineSmooth: false
    }
    const firstChart = {
      series: [
        {
          name: 'series-1',
          data: this.mapData(dataSerie)
        }
      ]
    }
    return (
      <div className="divider">
        <div className="chart">
          <ChartistGraph data={firstChart} options={options} type={type} />
        </div>
      </div>
    )
  }
}

export default AssetChartChartist
