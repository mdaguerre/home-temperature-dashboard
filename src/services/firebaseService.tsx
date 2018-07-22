import * as firebase from 'firebase';
import { FirebaseConfig } from '../config/firebase';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface TempModel {
    temp: number;
    humidity: number;
    date: number;
}
  
export interface TemperatureRead {
    temp: number;
    humidity: number;
    dateStr: string;
    date: moment.Moment;
}

export class FirebaseService {

    private firebaseInstance: firebase.app.App;

    constructor() {
        this.firebaseInstance = firebase.initializeApp(FirebaseConfig);
    }

    public listenToDatabase(ref: string, callback: Function) {
        this.firebaseInstance.database().ref(ref).on('value', (snapshot: firebase.database.DataSnapshot) => {
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
      
            callback(data);
           
          }, (errorObject: any) => {
            console.log('The read failed: ' + errorObject.code);
          });
    }
}