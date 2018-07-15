import * as React from 'react';
import { Component } from 'react';
import * as firebase from 'firebase';
import { FirebaseConfig } from './config/firebase';
import * as _ from 'lodash';
import * as moment from 'moment';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TempModel {
  temp: number;
  humidity: number;
  date: number;
}

interface TemperatureRead {
  temp: number;
  humidity: number;
  date: string;
}
interface Props {
}

interface State {
  data: TemperatureRead[];
  lastRead: TemperatureRead | null;
}



class App extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      lastRead: null
    };
  }

  componentWillMount() {
    let data: TemperatureRead[] = [];
    firebase.initializeApp(FirebaseConfig);
    // firebase.database().ref('home/temp').once('value').then((snapshot: firebase.database.DataSnapshot) => {
    //   _.forEach(snapshot.val(), (read: TempModel) => {
        
    //     if (read.humidity === 0) {
    //       return;
    //     }

    //     const date = moment.unix(read.date);

    //     data.push({
    //       temp: read.temp,
    //       humidity: read.humidity,
    //       date: date.format('DD-MM-YY H:mm:s')
    //     });
    //   });

    //   this.setState({
    //     data: data
    //   });
    // });

    firebase.database().ref('home/temp').on('value', (snapshot: firebase.database.DataSnapshot) => {
      console.log('add');
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
          date: date.format('DD-MM-YY H:mm:s')
        });
      });

      this.setState({
        data: data
      }, this.updateLastRead);

    }, (errorObject: any) => {
      console.log('The read failed: ' + errorObject.code);
    });
  }

  updateLastRead(): void {
    const length = this.state.data.length;

    this.setState({
      lastRead: this.state.data[length - 1]
    });
  }


  public render() {
    return (
      <div className="App">
        <LineChart 
            width={600} 
            height={300} 
            data={this.state.data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}
        >
            <XAxis dataKey="date"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Line type="monotone" dot={false} dataKey="temp" stroke="#8884d8" />
            <Line type="monotone" dot={false} dataKey="humidity" stroke="#82ca9d" />
        </LineChart>
        { this.state.lastRead != null && ( 
        <div>
          Temp: {this.state.lastRead.temp}
          H: {this.state.lastRead.humidity}
        </div>
        )}
      </div>
    );
  }
}

export default App;
