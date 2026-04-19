import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.css'
})
export class LoginScreen {
  loginForm: FormGroup;
  emailErrorMessage: string;
  passwordErrorMessage: string;
  sucessLogin: string;
  errorLogin: string;
  
  constructor(private fb: FormBuilder, private router: Router) {  
    this.loginForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });

    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";
  }

  async onLoginClick(){ 
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    if (email === "") {  
      this.emailErrorMessage = "O campo de e-mail é obrigatório";
      return;
    }

    if (password === "") {
      this.passwordErrorMessage = "O campo de senha é obrigatório";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const json = await response.json();

      console.log("Resposta:", json);

      if (response.ok && json.success) {
        this.sucessLogin = "Login feito com sucesso";
        this.errorLogin = "";

        const meuToken = json.data.token;
        const userId = json.data.user._id;

        localStorage.setItem("meuToken", meuToken);
        localStorage.setItem("meuId", userId);

        this.router.navigate(['/chat']);

      } else {
        this.errorLogin = json.message || "Email ou senha incorretos";
        this.sucessLogin = "";
      }

    } catch (error) {
      console.error("Erro na requisição:", error);
      this.errorLogin = "Erro ao conectar com o servidor";
      this.sucessLogin = "";
    }
  }

  goToNewUser() {
    this.router.navigate(['/new-user']);
  }
}