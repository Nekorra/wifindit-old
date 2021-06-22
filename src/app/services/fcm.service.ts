import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Capacitor } from '@capacitor/core'

// https://medium.freecodecamp.org/how-to-get-push-notifications-working-with-ionic-4-and-firebase-ad87cc92394e
@Injectable({
  providedIn: 'root'
})
export class FcmService {
  
  token: any;

  constructor(
    private afs: AngularFirestore,
    private platform: Platform,
    private auth: AuthService,
    private firebase: FirebaseX) { }
 
  async getToken() {
    if(Capacitor.platform == "ios"){
      this.firebase.getToken().then((res) => {
        this.token = res;
      })
      console.log("THIS IS NOTIF TOKEN", this.token);
      await this.firebase.grantPermission();

    }
    this.saveToken(this.token);
  }
 
  private saveToken(token) {
    if (!this.token) return;
    console.log("GOING TO PUT TO TOKEN")
    const devicesRef = this.afs.collection('devices');
 
    const data = {
      token: this.token,
      userId: this.auth.currentUserId
    };
 
    return devicesRef.doc(this.auth.currentUserId).set(data);
  }
 
  onNotifications() {
    return this.firebase.onMessageReceived();
  }
}