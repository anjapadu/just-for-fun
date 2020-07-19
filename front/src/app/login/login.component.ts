import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {FormControl, Validators} from '@angular/forms';
import { auth } from 'firebase/app'
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(public auth: AngularFireAuth, public router: Router,  private snackbar: MatSnackBar) {
    this.login = this.login.bind(this)
   }

  ngOnInit(): void {
  }
   email = new FormControl('', [Validators.required, Validators.email]);
  login() {
    const fail = (error) => this.snackbar.open(`Something went wrong:  ${error}`, 'Okay!', {
      duration: 5000,
    });
    this.auth.signInWithPopup(new auth.GoogleAuthProvider())
    .then(()=>{
      this.router.navigate(["home"])
    })
    .catch(function(error) {
      fail(error.message)
    });
  }
  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }
}
