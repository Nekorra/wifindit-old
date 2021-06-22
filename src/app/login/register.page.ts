import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Storage } from '@capacitor/core';


@Component({
  selector: 'app-register',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  name: string="";
  Nickname: string = '';
  // tslint:disable-next-line: max-line-length
  constructor(private fb: FormBuilder, private auth: AuthService, private alertCtrl: AlertController, private toastCtrl: ToastController, private router: Router, public afAuth: AngularFireAuth,) { }
 
  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nickname: ['', Validators.required]
    });
  }
 
  register() {
    this.auth.isNicknameAvailable(this.registerForm.value.nickname).subscribe(res => {
        Storage.set({
        key: 'name',
        value: this.Nickname
      }),
      this.auth.signUp(this.registerForm.value).then(async (res) => {
        this.auth.setLocationValues(this.registerForm.value);
        let toast = await this.toastCtrl.create({
          duration: 3000,
          message: 'Successfully created new Account!'
        });
        toast.present();
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
} 