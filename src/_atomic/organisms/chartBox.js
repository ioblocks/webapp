import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, BarSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateY,
  MouseCoordinateX
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { StandardDeviationChannel, DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import { last, toObject } from "react-stockcharts/lib/utils";
import {
  saveInteractiveNodes,
  getInteractiveNodes,
} from "../../_utils/interactiveutils";
import { Row, Col } from 'react-flexbox-grid';
import styles from './chartBox.module.css'
import Paper from 'material-ui/Paper'
import Loading from '../atoms/loading'
import BoxTitle from '../atoms/boxTitle'

const paperStyle = {
  // paddingLeft: "12px"
}

class ChartBox extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onDrawComplete = this.onDrawComplete.bind(this);
    this.saveInteractiveNode = this.saveInteractiveNode.bind(this);
    this.saveCanvasNode = this.saveCanvasNode.bind(this);

    this.handleSelection = this.handleSelection.bind(this);

    this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
    this.getInteractiveNodes = getInteractiveNodes.bind(this);

    this.state = {
      enableInteractiveObject: true,
      channels_1: []
    };
  }

  static propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
    loading: PropTypes.bool
  };

  static defaultProps = {
    type: "svg",
    loading: true
  };

  saveInteractiveNode(node) {
    this.node = node;
  }

  saveCanvasNode(node) {
    this.canvasNode = node;
  }

  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  handleSelection(interactives) {
    const state = toObject(interactives, each => {
      return [
        `channels_${each.chartId}`,
        each.objects,
      ];
    });
    this.setState(state);
  }

  onDrawComplete(channels_1) {
    // this gets called on
    // 1. draw complete of drawing object
    // 2. drag complete of drawing object
    this.setState({
      enableInteractiveObject: false,
      channels_1
    });
  }

  onKeyPress(e) {
    const keyCode = e.which;
    console.log(keyCode);
    switch (keyCode) {
      case 46: {
        // DEL
        const channels_1 = this.state.channels_1
          .filter(each => !each.selected);

        this.canvasNode.cancelDrag();
        this.setState({
          channels_1,
        });
        break;
      }
      case 27: {
        // ESC
        this.node.terminate();
        this.canvasNode.cancelDrag();
        this.setState({
          enableInteractiveObject: false
        });
        break;
      }
      case 68: // D - Draw drawing object
      case 69: {
        // E - Enable drawing object
        this.setState({
          enableInteractiveObject: true
        });
        break;
      }
    }
  }

  render() {
    const { type, data: initialData, width, ratio } = this.props;
    const { channels_1 } = this.state;
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      initialData
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    if (this.props.data.length === 0 || this.props.loading) {
      return (      
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'MARKET'} />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.marketBoxContainer}>
                    <Col xs={12}>
                      <Loading size={35}/>
                    </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
      )
    }

    return (

      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'MARKET'} />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.marketBoxContainer}>
                  <Col xs={12}>

                    <ChartCanvas ref={this.saveCanvasNode}
                      height={400}
                      width={width}
                      ratio={ratio}
                      margin={{ left: 50, right: 55, top: 10, bottom: 30 }}
                      type={type}
                      seriesName="MSFT"
                      data={data}
                      xScale={xScale}
                      xAccessor={xAccessor}
                      displayXAccessor={displayXAccessor}
                      xExtents={xExtents}
                    >
                      <Chart
                        id={1}
                        yExtents={[d => [d.high, d.low]]}
                        padding={{ top: 10, bottom: 20 }}
                        height={300}
                      >

                        <YAxis axisAt="right" orient="right" ticks={5} />
                        <XAxis axisAt="bottom" orient="bottom" showTicks={false} />

                        <MouseCoordinateY
                          at="right"
                          orient="right"
                          displayFormat={format(".2f")}
                        />
                        <MouseCoordinateX
                          at="bottom"
                          orient="bottom"
                          displayFormat={timeFormat("%Y-%m-%d")}
                        />
                        <CandlestickSeries />

                        <EdgeIndicator
                          itemType="last"
                          orient="right"
                          edgeAt="right"
                          yAccessor={d => d.close}
                          fill={d => (d.close > d.open ? "#6BA583" : "#FF0000")}
                        />

                        <OHLCTooltip origin={[-40, 0]} />

                        {/* <StandardDeviationChannel
                          ref={this.saveInteractiveNodes("StandardDeviationChannel", 1)}
                          enabled={this.state.enableInteractiveObject}
                          onStart={() => console.log("START")}
                          onComplete={this.onDrawComplete}
                          channels={channels_1}
                        /> */}
                      </Chart>
                      <Chart id={2} origin={(w, h) => [0, h - 50]} height={50} yExtents={d => d.volume}>
                        <XAxis axisAt="bottom" orient="bottom" />
                        <YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")} />
                        <BarSeries yAccessor={d => d.volume} fill={(d) => d.close > d.open ? "#6BA583" : "red"} />
                      </Chart>
                      <CrossHairCursor />
                      {/* <DrawingObjectSelector
                        enabled={!this.state.enableInteractiveObject}
                        getInteractiveNodes={this.getInteractiveNodes}
                        drawingObjectMap={{
                          StandardDeviationChannel: "channels"
                        }}
                        onSelect={this.handleSelection}
                      /> */}
                    </ChartCanvas>

                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}





export default fitWidth(ChartBox);
