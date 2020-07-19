import { NgModule } from '@angular/core';
import { AngularFireAuthGuard,redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { HomeComponent } from './home/home.component'

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login'])
const redirectLoggedInToHome = () => redirectLoggedInTo(['home'])

const routes: Routes = [
  {path: '', component: LoginComponent, canActivate: [AngularFireAuthGuard] ,data: { authGuardPipe: redirectLoggedInToHome }},
  {path: 'home', component: HomeComponent, canActivate: [AngularFireAuthGuard],data: { authGuardPipe: redirectUnauthorizedToLogin }},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
