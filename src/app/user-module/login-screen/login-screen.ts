import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.css'
})
export class LoginScreen {
  loginForm: FormGroup;
  constructor(private fb:FormBuilder) {  
    //inicia o formulario
    //Cria o campo obrigatorio de email.
    //Cria o campo obrigatorio da senha.
    this.loginForm=this.fb.group({
      email: ["",[Validators.required]],
      password: ["",[Validators.required]]
    })
  }
  onLoginClick(){ 
    alert("Botão de login clicado")
    console.log("Email",this.loginForm.value.email)
    console.log("Password",this.loginForm.value.password)
  }
}
