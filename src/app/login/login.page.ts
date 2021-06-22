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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
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

  @ViewChild('flipcontainer', { static: false }) flipcontainer: ElementRef;

  constructor(public loadingController: LoadingController,private nativeStorage: NativeStorage, private storage: Storage,private fb: FormBuilder, private auth: AuthService, private alertCtrl: AlertController, private toastCtrl: ToastController, private router: Router, public afAuth: AngularFireAuth, private faio: FingerprintAIO) { }
 
  ngOnInit() {
    this.nativeStorage.getItem('UserID').then((val) =>  {
      if (val == "okay") {
        this.presentLoading()
        this.router.navigateByUrl('/dashboard');
      }
    }
  );

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

 
  login() {
    this.auth.signIn(this.loginForm.value).then((res) => {
      if (this.rememberlogin = true) {
        this.nativeStorage.setItem('UserID', 'okay');
      } else {
        this.nativeStorage.remove('UserID')
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
  }

  loginFingerPrint() {
    this.faio.show({
      title: 'Biometric Authentication', // (Android Only) | option al | Default: "<APP_NAME> Biometric Sign On"
      subtitle: 'Coolest Plugin ever', // (Android Only) | optional | Default: null
      description: 'Please authenticate', // optional | Default: null
      fallbackButtonTitle: 'Use Backup', // optional | When disableBackup is false defaults to "Use Pin".
                                        // When disableBackup is true defaults to "Cancel"
     disableBackup:true,  // optional | default: false
    })
    .then(result => {
      this.router.navigateByUrl('/dashboard');
    })
    .catch(err => {
      console.log("Error: ", err);
    })
  }
 
  async openReset() {
    let inputAlert = await this.alertCtrl.create({
      header: 'Reset Password',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: data => {
            this.resetPw(data.email);
          }
        }
      ]
    });
    inputAlert.present();
  }
 
  resetPw(email) {
    this.auth.resetPw(email).then(async (res) => {
      let toast = await this.toastCtrl.create({
        duration: 3000,
        message: 'Success! Check your Emails for more information.'
      });
      toast.present();
    }, async (err) => { 
      let alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message,
        buttons: ['OK']
      });
      alert.present();
    });
  }

  
  async go() {
    this.router.navigate(['/register'])
  }

  async register() {
    this.auth.isNicknameAvailable(this.registerForm.value.nickname).subscribe(res => {
      this.auth.signUp(this.registerForm.value).then(async (res) => {
        this.auth.setLocationValues(this.registerForm.value);
        let toast = await this.toastCtrl.create({
          duration: 3000,
          message: 'Successfully created new Account!'
        });
        this.router.navigateByUrl('/dashboard');
        toast.present();
        if (this.rememberregister = true) {
          await this.nativeStorage.setItem('UserID', 'okay');
        }
        
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

  toggleRegister() {
    this.flipcontainer.nativeElement.classList.toggle('flip');
  }

}