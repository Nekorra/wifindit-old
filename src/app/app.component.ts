import { Component } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FcmService } from './services/fcm.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { User } from 'firebase';
import { tap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { MenuController } from '@ionic/angular'; 


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  totalcoin: number;
  userId: string;
  user: User = null;
  usersCollection: AngularFirestoreCollection<any>;

  name = '';
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private db: AngularFirestore, 
    private afAuth: AngularFireAuth,
    private storage: Storage,
    private router: Router,
    private nativeStorage: NativeStorage,
    private menu: MenuController,
    private fcm: FcmService,
    private alertCtrl: AlertController

  ) {
    this.initializeApp();
    this.afAuth.authState.subscribe(res => {
      this.user = res;
      if (this.user) {
        this.db.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap(res => {
            this.totalcoin = res['credits'];
          })
        ).subscribe()
      }else{
        console.log('fail');
      }
    })    
  }
  
  get currentUserId(): string {
    return this.authenticated ? this.user.uid : '';
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  initializeApp() { //aight go ahead
    console.log("FIRST INI APP")
    this.platform.ready().then(() => {
      console.log("SECOND INI APP")
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
      this.afAuth.authState.subscribe(user => {
        if (user) {
          console.log("Logged notifs")
          this.notificationSetup();
          //this.router.navigateByUrl('/chats');
        }
      })
    });
  }
  getName(){
    return this.authService.getName();
  }
 
  notificationSetup() {
    this.fcm.getToken();
    this.fcm.onNotifications().subscribe(msg => {
      console.log('Msg: ', msg);
      if (msg.tap >= 1) {
        this.router.navigateByUrl(`/chat/${msg.chat}`);
      } else {
        if (this.platform.is('ios')) {
          this.presentAlert(msg.aps.alert, msg.chat);
        } else {
          this.presentAlert(msg, msg.chat);
        } 
      }
    });
  }

  private async presentAlert(info, chat) {
    const toast = await this.alertCtrl.create({
      header: info.title,
      message: 'Would you like to open the chat now?',
      buttons: [
        {
          text: 'No',
          role: 'Cancel'
        }, {
          text: 'Yes',
          handler: () => {
            this.router.navigateByUrl(`/chat/${chat}`);
          }
        }
      ]
    })
    toast.present();
  }

  async logout() {
    this.menu.close();
    this.router.navigateByUrl('/login');
    this.nativeStorage.clear()
  }
} 
