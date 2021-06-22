import { ToastController } from '@ionic/angular';
import { Component, OnInit, RendererFactory2, Inject, Renderer2 } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { DOCUMENT } from '@angular/common';
import { tap, map } from 'rxjs/operators';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userInfo
  renderer: Renderer2;

  toggleValue = false;
  currentUserId;
  currentUser;
  numHotspotsConnect;

  constructor(private afs: AngularFirestore, private authService: AuthService, 
    private auth: AngularFireAuth,private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) {
    this.userInfo = afs.doc(`users/${firebase.auth().currentUser.uid}`);
    console.log(this.userInfo);
    this.renderer = rendererFactory.createRenderer(null,null);
   }
 
  ngOnInit() {
    this.getHotspotsConnected();
  };

  getHotspotsConnected() {
    this.currentUserId = this.authService.currentUserId;
    this.auth.authState.subscribe(res => {
      this.currentUser = res;
        this.afs.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap(res => {
            this.numHotspotsConnect = res['numHotspotsConnected'];
            
          })
        ).subscribe()
      });  
  }
 

  enableLight() {
    this.renderer.removeClass(this.document.body, 'dark-theme');
  }

  enableDark() {
    this.renderer.addClass(this.document.body, 'dark-theme');
  }

  

  switch() {

    if (this.toggleValue) {
      this.enableLight();
    }

    if (!this.toggleValue) {
      this.enableDark();
    }

  }

  

}