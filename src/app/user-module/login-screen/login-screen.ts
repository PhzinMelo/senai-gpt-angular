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
  async onLoginClick(){ 
    alert("Botão de login clicado")
    console.log("Email",this.loginForm.value.email)
    console.log("Password",this.loginForm.value.password)
    
    if(this.loginForm.value.email ==""){  
      alert("Preencha o email")
    return; }

    if (this.loginForm.value.password =="") {
      alert("Preencha a senha")
    return;
    }
    
    let response =await fetch("https://senai-gpt-api.azurewebsites.net/login", {  
      method: "Post",
      headers: {  
        "Content-Type" : "application/json"
      },body: JSON.stringify({ 
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      })
   
    
    })
     
    console.log("Status code" + response.status);

    if (response.status>=200 && response.status<=299) {  
      alert("Deu bom paizao")
    }
    else  {  
      alert("Deu ruim paizao")
    }
    
    let email2 =this.loginForm.value.email ;
    let password2=this.loginForm.value.password ;
    if (email2.lenght ===0) {
      alert('Campo de email obrigatorio') }
    else if(password2.lenght ===0){
      alert(`Campo de senha obrigatorio`)}
      
    
  }
}
