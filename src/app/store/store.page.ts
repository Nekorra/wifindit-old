import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { MenuController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import * as dropin from 'braintree-web-drop-in';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage {

  user: string;
  cartActive = true;
  products = [];
  locationsCollection: AngularFirestoreCollection<any>;
  @ViewChild('dropinContainer', {static: false}) container: ElementRef;
  dropinInstance: dropin.Dropin = null;
  
  constructor(
    public loadingController: LoadingController, 
    private plt: Platform, 
    private alertController: AlertController, 
    private ref: ChangeDetectorRef, 
    private afs: AngularFirestore,
    private menu: MenuController,
    private http: HttpClient) { 
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 10000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
      buttons: ['OK']
    });
 
    await alert.present();
  }

  ionViewWillEnter() {
    this.cartActive = true;
    this.dropinInstance.teardown().then(err => {
      console.log(err)
    });
  }

  addCoins(amount){
    this.user = firebase.auth().currentUser.uid;
    this.afs.doc(`users/${this.user}`).update({
      credits: firebase.firestore.FieldValue.increment(amount),
    });
    this.locationsCollection = this.afs.collection(
      `locations/public/track/`,
      ref => ref.orderBy('timestamp')
    );
    this.locationsCollection.doc(this.user).update({
      credits: firebase.firestore.FieldValue.increment(amount),
    });
  }

  async checkout800() {
    if (this.cartActive) {
      this.showDropin800();
    } else {
      // perform real payment
      const loading = await this.loadingController.create({
        message: 'Placing order...',
        spinner: 'bubbles'
      });
      await loading.present();
 
      this.dropinInstance.requestPaymentMethod((requestPaymentMethodErr: any, payload) => {
        console.log('payload: ', payload);
        if (!requestPaymentMethodErr && payload) {
          this.checkoutreq(2.99, payload.nonce).subscribe((res: any) => {
            loading.dismiss();
            
            if (res.success) {
              console.log('payment success: ', res);
              this.addCoins(900)
              this.presentSuccess();
            } else {
              console.log('Server returned error: ', res);
              this.dropinInstance.clearSelectedPaymentMethod();
              this.presentAlert(res.message);
            }
          });
        } else {
          loading.dismiss();
          console.log('Payment handling error: ', requestPaymentMethodErr);
          this.dropinInstance.clearSelectedPaymentMethod();
          this.presentAlert(requestPaymentMethodErr.message);
        }
      });
    }
  }

  async checkout1800() {
    if (this.cartActive) {
      this.showDropin1800();
    } else {
      // perform real payment
      const loading = await this.loadingController.create({
        message: 'Placing order...',
        spinner: 'bubbles'
      });
      await loading.present();
 
      this.dropinInstance.requestPaymentMethod((requestPaymentMethodErr: any, payload) => {
        console.log('payload: ', payload);
        if (!requestPaymentMethodErr && payload) {
          this.checkoutreq(4.99, payload.nonce).subscribe((res: any) => {
            loading.dismiss();
            
            if (res.success) {
              console.log('payment success: ', res);
              this.presentSuccess();
              this.addCoins(1800)
            } else {
              console.log('Server returned error: ', res);
              this.dropinInstance.clearSelectedPaymentMethod();
              this.presentAlert(res.message);
            }
          });
        } else {
          loading.dismiss();
          console.log('Payment handling error: ', requestPaymentMethodErr);
          this.dropinInstance.clearSelectedPaymentMethod();
          this.presentAlert(requestPaymentMethodErr.message);
        }
      });
    }
  }

  async checkout3600() {
    if (this.cartActive) {
      this.showDropin3600();
    } else {
      // perform real payment
      const loading = await this.loadingController.create({
        message: 'Placing order...',
        spinner: 'bubbles'
      });
      await loading.present();
 
      this.dropinInstance.requestPaymentMethod((requestPaymentMethodErr: any, payload) => {
        console.log('payload: ', payload);
        if (!requestPaymentMethodErr && payload) {
          this.checkoutreq(7.99, payload.nonce).subscribe((res: any) => {
            loading.dismiss();
            
            if (res.success) {
              console.log('payment success: ', res);
              this.presentSuccess();
              this.addCoins(3600)
            } else { //YOOOO
              console.log('Server returned error: ', res);
              this.dropinInstance.clearSelectedPaymentMethod();
              this.presentAlert(res.message);
            }
          });
        } else {
          loading.dismiss();
          console.log('Payment handling error: ', requestPaymentMethodErr);
          this.dropinInstance.clearSelectedPaymentMethod();
          this.presentAlert(requestPaymentMethodErr.message);
        }
      });
    }
  }

  showDropin800() {
    this.cartActive = false;
    console.log(environment.braintree_key)
    dropin.create({
      authorization: environment.braintree_key,
      container: this.container.nativeElement,
      paypal: {
        flow: 'checkout',
        amount: 2.99,
        currency: 'USD'
      }
    }, (createErr, instance) => {
      console.log('error: ', createErr);
      console.log('instance: ', instance);
      this.dropinInstance = instance;
      this.dropinInstance.on('paymentMethodRequestable', (event) => {
        console.log('event: ', event);
        if (event.type == 'PayPalAccount') {
          this.checkout800();
        }
      })
    });
  }

  showDropin1800() {
    this.cartActive = false;
    console.log(environment.braintree_key)
    dropin.create({
      authorization: environment.braintree_key,
      container: this.container.nativeElement,
      paypal: {
        flow: 'checkout',
        amount: 4.99,
        currency: 'USD'
      }
    }, (createErr, instance) => {
      console.log('error: ', createErr);
      console.log('instance: ', instance);
      this.dropinInstance = instance;
      this.dropinInstance.on('paymentMethodRequestable', (event) => {
        console.log('event: ', event);
        if (event.type == 'PayPalAccount') {
          this.checkout1800();
        }
      })
    });
  }

  showDropin3600() {
    this.cartActive = false;
    console.log(environment.braintree_key)
    dropin.create({
      authorization: environment.braintree_key,
      container: this.container.nativeElement,
      paypal: {
        flow: 'checkout',
        amount: 7.99,
        currency: 'USD'
      }
    }, (createErr, instance) => {
      console.log('error: ', createErr);
      console.log('instance: ', instance);
      this.dropinInstance = instance;
      this.dropinInstance.on('paymentMethodRequestable', (event) => {
        console.log('event: ', event);
        if (event.type == 'PayPalAccount') {
          this.checkout3600();
        }
      })
    });
  }

  async presentSuccess() {
    const alert = await this.alertController.create({
      header: 'Order submitted',
      message: 'Thanks for your order!',
      buttons: [
        {
          text: 'Close',
          handler: () => {
            
          }
        }
      ]
    });
  
    await alert.present();
  }


  checkoutreq(amount, payment_method_nonce) {
    return this.http.post(`${environment.url}/checkout`, {
      amount,
      payment_method_nonce
    })
  }

  showStore() {
    this.cartActive = true;
    this.dropinInstance.teardown().then(err => {
      console.log(err)
    });
  }

}