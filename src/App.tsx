import * as React from 'react';
import { Component } from 'react';
import * as firebase from 'firebase';
import { FirebaseConfig } from './config/firebase';
import * as _ from 'lodash';
import * as moment from 'moment';
import './App.css';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TempModel {
  temp: number;
  humidity: number;
  date: number;
}

interface TemperatureRead {
  temp: number;
  humidity: number;
  dateStr: string;
  date: moment.Moment;
}
interface Props {
}

interface State {
  data: TemperatureRead[];
  lastRead: TemperatureRead | null;
}


class App extends Component<Props, State> {

  private interval: NodeJS.Timer;

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      lastRead: null
    };
  }

  componentDidMount() {
    firebase.initializeApp(FirebaseConfig);
    
    firebase.database().ref('home/temp').on('value', (snapshot: firebase.database.DataSnapshot) => {
      const data: TemperatureRead[] = [];
      let previousTemp: number|null = null;
      
      _.forEach(snapshot.val(), (read: TempModel) => {
        
        if (read.humidity === 0) {
          return;
        }

        if (previousTemp && read.temp <= (previousTemp / 2) ) {
          return;
        }

        previousTemp = read.temp;
        const date = moment.unix(read.date);

        data.push({
          temp: read.temp,
          humidity: read.humidity,
          dateStr: date.format('DD-MM-YY H:mm:s'),
          date: date
        });

      });

      const totalTemp = _.sumBy(data, 'temp');
      const avgTemp = totalTemp / data.length - 1;
      console.log('Avg Temp: ' + avgTemp);

      this.setState({
        data: data
      }, this.updateLastRead);

    }, (errorObject: any) => {
      console.log('The read failed: ' + errorObject.code);
    });

    this.interval = setInterval(this.updateLastRead, 3000);
  }

  componentWillUnmount() {
    // remove the interval listener
    clearInterval(this.interval);
  }

  updateLastRead = (): void => {
    const length = this.state.data.length;

    this.setState({
      lastRead: this.state.data[length - 1]
    });
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
                { this.state.lastRead != null && (
                  <div className="info-container"> 
                   <div className="info-row">                
                      <small>{this.state.lastRead.date.fromNow()}</small>
                    </div>
                   
                    <div className="info-row">                
                      <i className="fas fa-tint" />
                      <span>
                        {`${this.state.lastRead.humidity}%`}
                      </span>
                    </div>
                   
                    <div className="info-row">
                      <i className="fas fa-thermometer-half" />
                      <span>
                        {`${this.state.lastRead.temp} °C`}
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
                  data={this.state.data.slice()}
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
