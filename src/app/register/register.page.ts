import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
//hello maam ye 
import { Storage } from '@ionic/storage';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loginForm: FormGroup;
  splash = true;
  name = '';
  emal: string;
  password1: string;
  rememberlogin: boolean;
  rememberregister

  registerForm: FormGroup;
  registerName: string="";
  Nickname: string = '';
  registered: boolean = false;


  constructor(public loadingController: LoadingController,private nativeStorage: NativeStorage, private storage: Storage,private fb: FormBuilder, private auth: AuthService, private alertCtrl: AlertController, private toastCtrl: ToastController, private router: Router, public afAuth: AngularFireAuth, private faio: FingerprintAIO) { }

  ngOnInit() {

    setTimeout(() => this.splash = false, 4000);
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nickname: [null],

    });
    
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nickname: ['', Validators.required],
    });

  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Logging In...',
      duration: 2000
    });
    await loading.present();
  }

  async register() {
    this.auth.isNicknameAvailable(this.registerForm.value.nickname).subscribe(res => {
      this.auth.signUp(this.registerForm.value).then(async (res) => {
        this.auth.setLocationValues(this.registerForm.value);
        let toast = await this.toastCtrl.create({
          duration: 3000,
          message: 'Successfully created new Account!'
        });
        toast.present();
        if (this.rememberregister = true) {
          await this.nativeStorage.setItem('UserID', 'okay');
        }
        this.router.navigateByUrl('/dashboard');
      }, async (err) => {
        let alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message,
          buttons: ['OK']
        });
        alert.present();
      }) 
    })
  }

  go() {
    this.router.navigateByUrl("/login")
  }


}
