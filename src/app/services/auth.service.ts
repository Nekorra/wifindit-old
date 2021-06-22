import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { take, map, tap } from 'rxjs/operators';
import { first } from 'rxjs/operators';
import { Storage } from '@capacitor/core';

export interface UserCredentials {
  nickname: string;
  email: string;
  password: string;
}
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User = null;
  nickname = '';
  nicknameDashboard = '';
  userid: string;
 
  constructor (private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.afAuth.authState.subscribe(res => {
      this.user = res;
      if (this.user) {
        this.db.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap(res => {
            this.nickname = res['nickname'];
            console.log(this.nickname);
            this.nicknameDashboard = this.nickname;
          })
        ).subscribe();
      }else{
        console.log('line 33 auth service');
      }
    })
   } 
//theres a credential.nickname
  signUp(credentials: UserCredentials) {
    return firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((data) => {
        return this.db.doc(`users/${data.user.uid}`).set({
          nickname: credentials.nickname,
          email: data.user.email,
          credits: 0,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          numHotspotsConnected: 0
        });
      }); 
  }

  setLocationValues(credentials: UserCredentials) {
    this.userid = firebase.auth().currentUser.uid;
    this.db.doc(`locations/public/track/${this.userid}`).set({
      nickname: credentials.nickname,
      email: credentials.email,
      credits: 0,
      userid: this.user.uid,
    });
//ok lez try it hoooooo dude i nee email?


  }
  
  async getUser() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  getName(){
    return this.nickname;
  }

  isNicknameAvailable(name) {
    return this.db.collection('users', ref => ref.where('nickname', '==', name).limit(1)).valueChanges().pipe(
      take(1),
      map(user =>{
        return user;
      })
    );
  }
 
  signIn(credentials: UserCredentials) {
    return firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password);
  }
 
  signOut() {
    
    
    return firebase.auth().signOut();
  }
 
  resetPw(email) {
    return firebase.auth().sendPasswordResetEmail(email);
  }
 
  updateUser(nickname) {
    return this.db.doc(`users/${this.currentUserId}`).update({
      nickname
    });
  }
 
  get authenticated(): boolean {
    return this.user !== null;
  }
 
  get currentUser(): any {
    return this.authenticated ? this.user : null;
  }
 
  get currentUserId(): string {
    return this.authenticated ? this.user.uid : '';
  }
}