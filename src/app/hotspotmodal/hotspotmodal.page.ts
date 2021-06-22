import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';


@Component({
  selector: 'app-hotspotmodal',
  templateUrl: './hotspotmodal.page.html',
  styleUrls: ['./hotspotmodal.page.scss'],
})
export class HotspotmodalPage implements OnInit {

  hotspotName: string;
  hotspotPass: string;
  user: string;
  locationsCollection: AngularFirestoreCollection<any>;

  constructor(private ModalController: ModalController, private afs: AngularFirestore,) { }

  ngOnInit() {
    
  }

  CloseModal() {
    this.ModalController.dismiss();
  }

  ReturnInfo() {
    if (this.hotspotPass.length < 8 ) {
      alert("Password has to be greater that 8 characters");
      return;
    }
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );
    console.log('hotspot info ', this.hotspotName, this.hotspotPass);
    this.user = firebase.auth().currentUser.uid;
      this.locationsCollection.doc(this.user).update({
        hotspotName: this.hotspotName,
        hotspotPass: this.hotspotPass,
      });
    alert("Hotspot configurations updated")
    this.CloseModal()
  }

}
