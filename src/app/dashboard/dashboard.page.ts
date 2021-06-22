 import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Plugins } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { NetworkStatus, PluginListenerHandle } from '@capacitor/core';
const { Geolocation } = Plugins;
import { ChatService } from 'src/app/services/chat.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import * as firebase from 'firebase/app';
import { AlertController } from '@ionic/angular';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import { ModalController } from '@ionic/angular';
import {HotspotmodalPage} from '../hotspotmodal/hotspotmodal.page'
import { MenuController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { interval } from 'rxjs';
import { Storage } from '@ionic/storage';
import { User } from 'firebase';
import { Network } from '@ionic-native/network/ngx';
import { environment } from '../../environments/environment';

declare var google;
declare var Enable;
declare var Disable;

import { map, tap, timestamp } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HotspotService } from '../services/hotspot.service';

import * as geofirex from 'geofirex';
const geo = geofirex.init(firebase);

const center = geo.point(40.1, -119.1);
const radius = 100;
const field = 'position';



@Component({
  selector: 'app-account',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;
  usersCollection: AngularFirestoreCollection<any>;
  user: string;
  name: string;
  NAME: string;
  emal: string;
  EMAL: string;
  userid: string;
  phone: string;
  participant: string;
  participant1: string;
  users = [];
  title = '';
  latitude: number;
  longitude: number;
  mylatitude: number;
  mylongitude: number;
  delete: boolean;
  hotspot: boolean = false;
  results = [];
  info_txt = "";
  HotspotName: string;
  HotspotPass: string;
  chosentime: string;
  userCredits: number;
  timerVar;
  timerVal;
  seconds;
  timerBool: boolean = true;
  totalTime: number;
  currentTime: number;
  otherUserid: string;
  checkchat: boolean = false;
  buyersCoins;
  currentUser;
  currentUserId;
  diron: boolean = false;
  dironswitch: boolean = false;
  numHotspotsConnect;
  useruser: User = null;
  directionsDisplay = new google.maps.DirectionsRenderer;
  icon;
  connectiontype: string;
  segment = "map"

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  @ViewChild('directionsPanel', { static : false }) directionsPanel: ElementRef;

  map: any;
  markers = [];

  isTracking = false;
  isOn = false;
  watch = null;


  // tslint:disable-next-line: max-line-length
  constructor(private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private fb: FormBuilder,
              private chatService: ChatService,
              private router: Router,
              private alertCtrl: AlertController,
              private authService: AuthService,
              private openNativeSettings: OpenNativeSettings,
              private hotspotPlugin: WifiWizard2,
              private ModalController: ModalController,
              private menu: MenuController,
              public actionSheetController: ActionSheetController,
              private storage: Storage,
              private network: Network

              ) {

    this.anonLogin();
  }

  togglemap() {
    this.segment = "map"
    this.loadMap();
    this.ionViewDidEnter();
    
  }

  togglepeople() {
    this.segment = "people"
    console.log(this.segment)
  }
  
  openFirst() {
    this.menu.open('main');
  } 
  
  OpenModal() {

    this.ModalController.create({component: HotspotmodalPage}).then((modalElement) => {
      modalElement.present();
    })
  }

  getName(){
    this.name = this.authService.getName();
  }

  
  async ngOnInit() {
    this.connectiontype = this.network.type 

    this.getName();
    this.user = firebase.auth().currentUser.uid;

  }


  ngOnDestroy() {
    this.deleteLocation();

  }

  ionViewWillEnter() {
    this.loadMap();
    this.user = firebase.auth().currentUser.uid;
    this.afs.doc(`users/${this.user}`).update({
      userid: firebase.auth().currentUser.uid,
    });

  }

  async ionViewDidEnter() {
    this.checkchat = false;
    this.isTracking = true;
    this.delete = true;
    this.connectiontype = this.network.type;
    this.watch = Geolocation.watchPosition({}, (position) => {
      if (position) {
        const posi = geo.point(position.coords.latitude,position.coords.longitude)
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp,
          this.user,
          this.connectiontype,
          posi
        );
      }
      this.locations.subscribe(position => {
        this.updateMap(position);
        return;
      })
      Geolocation.clearWatch({ id: this.watch }).then(() => {
        this.isTracking = false;
      });
      this.user = firebase.auth().currentUser.uid;
      this.delete = false;
      this.locationsCollection.doc(this.user).update({
        lat: firebase.firestore.FieldValue.delete(),
        lng: firebase.firestore.FieldValue.delete(),
        timestamp: firebase.firestore.FieldValue.delete(),
        user: firebase.firestore.FieldValue.delete(),
        posi: firebase.firestore.FieldValue.delete(),
      });
    });


  }


  anonLogin() {
    this.user = firebase.auth().currentUser.uid;
    console.log(this.user)
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );


    this.locations = this.locationsCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    )
  }

  loadMap() {
    let latLng = new google.maps.LatLng(51.9036442, 7.6673267);

    let mapOptions = {
      center: latLng,
      zoom: 1,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  }

  async chooseNav(pos) {
    const actionSheet = document.createElement('ion-action-sheet');
  
    actionSheet.header = 'Choose Nav type';
    actionSheet.cssClass = 'my-custom-class';
    actionSheet.buttons = [{
      text: 'Walking',
      icon: 'ios-walk',
      handler: () => {
        this.startNavigatingWalking(pos);

      }
    }, {
      text: 'Driving', 
      icon: 'ios-car',
      handler: () => {
        this.startNavigatingDriving(pos)
        
      }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel', 
      handler: () => {
        console.log('Cancel clicked');
      }
    }];
    document.body.appendChild(actionSheet);
    return actionSheet.present();
  }

  async startNavigatingWalking(pos) {
    let directionsService = new google.maps.DirectionsService;
    
      await Geolocation.getCurrentPosition().then((data) => {
        this.mylatitude = data.coords.latitude,
        this.mylongitude = data.coords.longitude,
        console.log('My latitude : ', data.coords.latitude);
        console.log('My longitude: ', data.coords.longitude);
      }).catch(err => {
        console.log(err)
        alert(err);
        return;
      });
  
      this.latitude = pos["lat"]
      this.longitude = pos["lng"]
      console.log("INFO: ", this.mylatitude, this.mylongitude, this.latitude, this.longitude);
  
      this.diron = true;
      
      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
      directionsService.route({
          origin: {lat: this.mylatitude, lng: this.mylongitude},
          destination: {lat: this.latitude, lng: this.longitude},
          travelMode: google.maps.TravelMode['WALKING']
      }, (res, status) => {
  
          if(status == google.maps.DirectionsStatus.OK){
              this.directionsDisplay.setDirections(res);
          } else {
              console.warn(status);
          }
  
      }); //follow me actaulalysdnm,fmmasd x 
      
  }

  async startNavigatingDriving(pos) {
    let directionsService = new google.maps.DirectionsService;
    
      await Geolocation.getCurrentPosition().then((data) => {
        this.mylatitude = data.coords.latitude,
        this.mylongitude = data.coords.longitude,
        console.log('My latitude : ', data.coords.latitude);
        console.log('My longitude: ', data.coords.longitude);
      }).catch(err => {
        console.log(err)
        alert(err);
        return;
      });
  
      this.latitude = pos["lat"]
      this.longitude = pos["lng"]
      console.log("INFO: ", this.mylatitude, this.mylongitude, this.latitude, this.longitude);
  
      this.diron = true;
      
      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
      directionsService.route({
          origin: {lat: this.mylatitude, lng: this.mylongitude},
          destination: {lat: this.latitude, lng: this.longitude},
          travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {
  
          if(status == google.maps.DirectionsStatus.OK){
              this.directionsDisplay.setDirections(res);
          } else {
              console.warn(status);
          }
  
      }); //follow me actaulalysdnm,fmmasd x 
      
  }
  //aight lets try this
  stopNavigation() {    
    this.diron = false;
    this.connectiontype = this.network.type;
    this.directionsDisplay.setMap(null);
    this.directionsDisplay.setPanel(null); 
    this.checkchat = false;
    this.isTracking = true;
    this.delete = true;
    this.watch = Geolocation.watchPosition({}, (position) => {
      if (position) {
        const posi = geo.point(position.coords.latitude,position.coords.longitude)
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp,
          this.user,
          this.connectiontype,
          posi
        );
      }
      this.locations.subscribe(position => {
        this.updateMap(position);
        return;
      })
      Geolocation.clearWatch({ id: this.watch }).then(() => {
        this.isTracking = false;
      });
      this.user = firebase.auth().currentUser.uid;
      this.delete = false;
      this.locationsCollection.doc(this.user).update({
        lat: firebase.firestore.FieldValue.delete(),
        lng: firebase.firestore.FieldValue.delete(),
        timestamp: firebase.firestore.FieldValue.delete(),
        user: firebase.firestore.FieldValue.delete(),
        posi: firebase.firestore.FieldValue.delete(),
      });
    });
  } 



  startTracking(pos) {
    this.connectiontype = this.network.type;
    alert("Make sure your hotspot configuration is up-to-date")
    this.isTracking = true;
    this.isOn = true;
    this.delete = true;
    this.watch = Geolocation.watchPosition({}, (position) => {
      if (position) {
        const posi = geo.point(position.coords.latitude,position.coords.longitude)
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp,
          this.user,
          this.connectiontype,
          posi
        );
      }
      this.locations.subscribe(position => {
        this.updateMap(position);
        return;
      })
      Geolocation.clearWatch({ id: this.watch }).then(() => {
        this.isTracking = false;
      });
    });
  }


  updateMap(locations) {

    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let loc of locations) {
      let latLng = new google.maps.LatLng(loc.lat, loc.lng);

      this.icon = {
        url: 'assets/mapicon.png',
        scaledSize: new google.maps.Size(50, 50),
      };
      

      

      let marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: this.icon
      });
      const contentString = 'Wifindit User';
      const infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 400
      });
      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
      this.markers.push(marker);
    }
    const query = geo.query(this.locationsCollection).within(center, radius, field);
  }


  addNewLocation(lat, lng, timestamp, user, connectiontype, posi) {
    this.locationsCollection.doc(this.user).update({
      lat,
      lng,
      timestamp,
      user,
      connectiontype,
      posi
    });


    let position = new google.maps.LatLng(lat, lng);
    this.map.setCenter(position);
    this.map.setZoom(15);
    return;
  }

  deleteLocation() {
    this.user = firebase.auth().currentUser.uid;
    this.delete = false;
    this.isOn = false;
    this.locationsCollection.doc(this.user).update({
      lat: firebase.firestore.FieldValue.delete(),
      lng: firebase.firestore.FieldValue.delete(),
      timestamp: firebase.firestore.FieldValue.delete(),
      user: firebase.firestore.FieldValue.delete(),
      posi: firebase.firestore.FieldValue.delete(),
    });
  }

  viewLocation(pos) {

    this.latitude = pos['lat'];
    this.longitude = pos['lng'];

    let position1 = new google.maps.LatLng(this.latitude, this.longitude);
    this.map.setCenter(position1);
    this.map.setZoom(16);

  }


  async createGroup(pos) {
    this.participant = pos['nickname']
    await this.getName();
    console.log(this.participant, this.participant1)
      this.chatService.createGroup(`chat with ${this.participant} & ${this.name}`, this.users).then(res => {
        console.log(this.users)
       this.router.navigateByUrl('/chats');
     });
  }

  
  async addUser(pos){
    this.users = [];
    this.participant = pos['nickname']
    console.log(this.participant);
    let obs = this.chatService.findUser(this.participant, null);
    forkJoin(obs).subscribe(res => {
      console.log('res: ',res);
      for(let data of res) {
        if(data.length > 0){
          console.log('data: ',data);
          this.users.push(data[0]);
          console.log("ping")
        }
      }
      this.participant = '';
      console.log("ping")
    });
    this.checkchat = true;
    alert("User added. Click again to chat with them!")
  }



  openHotspot() {
    this.openNativeSettings.open("tethering")
  }

  
  async connect(minutes,credits,pos) {
    this.HotspotName = pos['hotspotName'];
    this.HotspotPass = pos['hotspotPass'];
    this.otherUserid = pos['userid'];
    console.log("Otheruserid: " + this.otherUserid);
    this.NAME = pos['name'];
    
    
    if (this.getCredits() < credits) {
      alert("Not enough Credits")
      return;
    } 
    await this.hotspotPlugin.iOSConnectNetwork(this.HotspotName, this.HotspotPass).then(result => {
      if(result == this.HotspotName){ //aight go ahaed
        
        this.removeCoins(credits);
        this.timeHotspot(minutes, pos);

        this.currentUserId = this.authService.currentUserId;
        this.afAuth.authState.subscribe(res => {
          this.currentUser = res;
            this.afs.doc(`users/${this.currentUserId}`).valueChanges().pipe(
              tap(res => {
                this.numHotspotsConnect = res['numHotspotsConnected']; //this works it gets correct current number
                console.log(this.numHotspotsConnect) //aight. ill make it increment kk
                //what happening. 
              })
            ).subscribe()
            this.afs.doc(`users/${this.user}`).update({ // so is this where u wanna increment ya<
              numHotspotsConnected: firebase.firestore.FieldValue.increment(1), //this increments by one gg
            });
          });  
        
      }else{
        alert("can not connect")
      } 
    })
  }


  async disconnect(pos){
    await this.hotspotPlugin.iOSDisconnectNetwork(this.HotspotName);
    this.stopTimer();
    this.timerBool = !this.timerBool;
    this.addCreditsBack(pos);
  
  }


  async presentActionSheet(pos) {
    const actionSheet = document.createElement('ion-action-sheet');
  
    actionSheet.header = 'Choose Time Limit';
    actionSheet.cssClass = 'my-custom-class';
    actionSheet.buttons = [{
      text: '1 minutes (for testing)',
      icon: 'ios-time',
      handler: () => {
        this.userCredits = this.getCredits();
        this.connect(1,0,pos);

      }
    }, {
      text: '15 minute - 900 Credits', 
      icon: 'ios-time',
      handler: () => {
        this.userCredits = this.getCredits();
        this.connect(15,900,pos); 
        
      }
    }, {
      text: '30 minute - 1800 Credits', 
      icon: 'ios-time',
      handler: () => {
        this.userCredits = this.getCredits();
        this.connect(30,1800,pos); //hi
        
      }
    }, {
      text: '1 hour - 3600 ',
      icon: 'ios-time',
      handler: () => {
        this.userCredits = this.getCredits();
        this.connect(60,3600,pos);
      }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel', 
      handler: () => {
        console.log('Cancel clicked');
      }
    }];
    document.body.appendChild(actionSheet);
    return actionSheet.present();
  }

  getCredits() {
    this.currentUserId = this.authService.currentUserId;
    console.log("User Id for credits: " + this.currentUserId)
    this.afAuth.authState.subscribe(res => {
      this.currentUser = res;
      if (this.user) {
        this.afs.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap(res => {
            this.buyersCoins = res['credits'];
            
          })
        ).subscribe()
      }else{
        console.log('fail');
      }
    });
    return this.buyersCoins;    
  }

  addCreditsBack(pos) {
    //below is client - This works
    this.user = firebase.auth().currentUser.uid;
    this.afs.doc(`users/${this.user}`).update({
      credits: firebase.firestore.FieldValue.increment(this.totalTime - this.currentTime), 
    });
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );
    this.locationsCollection.doc(this.user).update({
      credits: firebase.firestore.FieldValue.increment(this.totalTime - this.currentTime), 
    });
    //below is provider - Does not work
    this.afs.doc(`users/${this.otherUserid}`).update({
      credits: firebase.firestore.FieldValue.increment(this.currentTime), 
    });
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );
    this.locationsCollection.doc(this.otherUserid).update({
      credits: firebase.firestore.FieldValue.increment(this.currentTime), 
    });
  }



  removeCoins(amount){
    this.user = firebase.auth().currentUser.uid;
    this.afs.doc(`users/${this.user}`).update({
      credits: firebase.firestore.FieldValue.increment(-1*amount), 
    });
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );
    this.locationsCollection.doc(this.user).update({
      credits: firebase.firestore.FieldValue.increment(-1*amount), 
    });
  }

  timeHotspot(minutes, pos){
    this.seconds = minutes * 60;
    this.startTimer(this.seconds, pos);
  }

  startTimer(seconds, pos){
    
    if (this.timerBool == true) {
      this.timerBool = false;
      this.totalTime = seconds;
      this.timerVar = interval(1000).subscribe( x => {

        this.currentTime = x;
        this.timerVal = seconds - x;
        console.log("Time: " + this.timerVal)
        if(this.timerVal == 0){
          this.timerVar.unsubscribe();
          this.addCreditsBack(pos);
          alert("Your time has expired and you have been disconnected from the network! Your total time spent was " + this.currentTime);
          this.timerBool = true;
          this.hotspotPlugin.iOSDisconnectNetwork(this.HotspotName)
          
        }
      })
    }

  }

  stopTimer(){
    this.timerVar.unsubscribe();
    alert("You have successfully disconnected and will receive your required credits back as soon as possible!")
    console.log("ENDING TIME:", this.currentTime)
  }

  


  
}
