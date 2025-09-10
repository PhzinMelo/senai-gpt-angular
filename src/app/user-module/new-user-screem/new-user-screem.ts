import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-new-user-screem',
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-screem.html',
  styleUrl: './new-user-screem.css'
})
export class NewUserScreem {
  loginForm: FormGroup;
  emailErrorMessage: string;
  passwordErrorMessage: string
  sucessLogin: string
  errorLogin: string
  constructor(private fb:FormBuilder, )  {  
    
    this.loginForm=this.fb.group({
      nome:["",[Validators.required]]
      email: ["",[Validators.required]],
      password: ["",[Validators.required]]
      password2:["",[Validators.required]]
    });
    this.emailErrorMessage= ""
    this.passwordErrorMessage= ""
    this.sucessLogin= ""
    this.errorLogin=""
  }
  }
