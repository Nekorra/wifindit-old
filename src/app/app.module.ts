import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth'; 
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { Contacts } from '@ionic-native/contacts/ngx';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { AngularFireStorageModule } from '@angular/fire/storage';

import { Camera } from '@ionic-native/camera/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { LoginPageModule } from './login/login.module';
import { FcmService } from './services/fcm.service';

import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

import {HotspotmodalPageModule} from './hotspotmodal/hotspotmodal.module';

import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';

import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { Network } from '@ionic-native/network/ngx';
import { FirebaseX } from "@ionic-native/firebase-x/ngx";

import { HttpClient, HttpClientModule } from '@angular/common/http'


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    AngularFireModule.initializeApp(environment.firebase),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFirestoreModule.enablePersistence(),
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    IonicStorageModule.forRoot(),
    LoginPageModule,
    HotspotmodalPageModule,
    HttpClientModule
  ],

  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Contacts,
    FcmService,
    OpenNativeSettings,
    WifiWizard2,
    InAppPurchase2,
    FingerprintAIO,
    NativeStorage,
    Network,
    FirebaseX,
    HttpClientModule,
    HttpClient,
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
