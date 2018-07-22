import * as React from 'react';
import { Component } from 'react';
import './App.css';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { FirebaseService, TemperatureRead } from './services/firebaseService';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
}

interface State {
  secondFloorData: TemperatureRead[];
  firstFloorData: TemperatureRead[];
  lastRead: object;
}

class App extends Component<Props, State> {

  private interval: NodeJS.Timer;
  private firebaseService: FirebaseService;

  constructor(props: Props) {
    super(props);

   
    this.state = {
      secondFloorData: [],
      firstFloorData: [],
      lastRead: {
        secondFloor : null,
        firstFloor: null
      }
    };
  }

  componentWillMount() {
    console.log('componentWillMount', this.firebaseService);

    if (!this.firebaseService) {
      this.firebaseService = new FirebaseService();
    }

    this.firebaseService.listenToDatabase('home/temp', this.updateSecondFloorData);
    this.firebaseService.listenToDatabase('home/temp_first_floor', this.updateFirstdloorData);
  }
  componentDidMount() {
    this.interval = setInterval(this.updateLastRead, 3000);
  }

  updateSecondFloorData = (data: TemperatureRead[]): void => {
    console.log('updateSecondFloorData');
    this.setState({
      secondFloorData: data
    }, this.updateLastRead);
  }

  updateFirstdloorData = (data: TemperatureRead[]): void => {
    console.log('updateFirstdloorData');
    this.setState({
      firstFloorData: data
    }, this.updateLastRead);
  }

  componentWillUnmount() {
    // remove the interval listener
    clearInterval(this.interval);
  }

  updateLastRead = (): boolean => {
    const firstFloorDataLength = this.state.firstFloorData.length;
    const secondFloorDataLength = this.state.secondFloorData.length;

    this.setState({
      lastRead: {
        firstFloor: this.state.firstFloorData[firstFloorDataLength - 1],
        secondFloor: this.state.secondFloorData[secondFloorDataLength - 1]
      }
    });

    return true;
  }


  public render() {
    return (
      <Grid className="App">
        <Row className="data-container">
          <Col xs={6} md={7} className="">

          <Panel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3">
                Upstairs
                { this.state.lastRead['secondFloor'] != null && (
                  <div className="info-container"> 
                   <div className="info-row">                
                      <small>{this.state.lastRead['secondFloor'].date.fromNow()}</small>
                    </div>
                   
                    <div className="info-row">                
                      <i className="fas fa-tint" />
                      <span>
                        {`${this.state.lastRead['secondFloor'].humidity}%`}
                      </span>
                    </div>
                   
                    <div className="info-row">
                      <i className="fas fa-thermometer-half" />
                      <span>
                        {`${this.state.lastRead['secondFloor'].temp} °C`}
                      </span>
                    </div>
                  </div>
                  )}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <LineChart 
                  width={600} 
                  height={200} 
                  data={this.state.secondFloorData.slice()}
                  margin={{top: 5, right: 30, left: 20, bottom: 5}}
              >
                  <XAxis dataKey="dateStr"/>
                  <YAxis/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Tooltip/>
                  <Legend />
                  <Line type="monotone" dot={false} dataKey="temp" stroke="#8884d8" />
                  <Line type="monotone" dot={false} dataKey="humidity" stroke="#82ca9d" />
              </LineChart>
            </Panel.Body>
          </Panel>
          </Col>
          <Col xs={6} md={7} className="">
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3">
                  First Floor
                  { this.state.lastRead['firstFloor'] != null && (
                    <div className="info-container"> 
                    <div className="info-row">                
                        <small>{this.state.lastRead['firstFloor'].date.fromNow()}</small>
                      </div>
                    
                      <div className="info-row">                
                        <i className="fas fa-tint" />
                        <span>
                          {`${this.state.lastRead['firstFloor'].humidity}%`}
                        </span>
                      </div>
                    
                      <div className="info-row">
                        <i className="fas fa-thermometer-half" />
                        <span>
                          {`${this.state.lastRead['firstFloor'].temp} °C`}
                        </span>
                      </div>
                    </div>
                    )}
                </Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <LineChart 
                    width={600} 
                    height={200} 
                    data={this.state.firstFloorData.slice()}
                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                >
                    <XAxis dataKey="dateStr"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend />
                    <Line type="monotone" dot={false} dataKey="temp" stroke="#8884d8" />
                    <Line type="monotone" dot={false} dataKey="humidity" stroke="#82ca9d" />
                </LineChart>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
