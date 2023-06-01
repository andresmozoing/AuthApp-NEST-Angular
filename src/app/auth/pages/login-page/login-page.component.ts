import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder , Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  public myForm : FormGroup = this.fb.group({
    email : ['' , [Validators.required , Validators.email]],
    password : ['', [Validators.required  , Validators.minLength(6)]]
  });


  public login(){
    const {email,password} = this.myForm.value
    this.authService.login(email,password)
      .subscribe({
        next: () => { this.router.navigateByUrl('/dashboard')},
        error : (err) => {
          console.log({ loginError : err});
          Swal.fire('Error',err,'error')

        }
      })
  }


}
