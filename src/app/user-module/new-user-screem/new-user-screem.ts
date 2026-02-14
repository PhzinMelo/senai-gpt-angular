import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-user-screem',
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-screem.html',
  styleUrl: './new-user-screem.css'
})
export class NewUserScreen {
  loginForm: FormGroup;
  nomeErrorMessage: string;
  emailErrorMessage: string;
  passwordErrorMessage: string;
  sucessLogin: string;
  errorLogin: string;

  constructor(private fb: FormBuilder,private router: Router) {
    this.loginForm = this.fb.group({
      nome: ["", [Validators.required,]],
      email: ["", [Validators.required,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      Validators.minLength(6)
      ]],
      password: ["", [Validators.required, Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Z]).+$/)
      ]],
      password2: ["", [Validators.required, Validators.minLength(6),]]
    });

    this.nomeErrorMessage = "";
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";
  }

  async onEnterClick() {
    // Limpa mensagens anteriores
    this.nomeErrorMessage = "";
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
    this.sucessLogin = "";
    this.errorLogin = "";

    // Pega os dados do formulário
    const nome = this.loginForm.value.nome;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const password2 = this.loginForm.value.password2;

    // Validações simples
    if (nome === "") {
      this.nomeErrorMessage = "O campo de nome é obrigatório";
      return;
    }

    //verificação de email
    if (email === "") {
      this.emailErrorMessage = "O campo de e-mail é obrigatório";
      return;
    }
    if (email.length < 9) {
      this.emailErrorMessage = "O e-mail deve ter pelo menos 9 caracteres";
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      this.emailErrorMessage = "O e-mail deve conter '@' e '.'";
      return;
    }

    //verificação de senha
    if (password === "") {
      this.passwordErrorMessage = "O campo de senha é obrigatório";
      return;
    }
    if (password.length < 6) {
      this.passwordErrorMessage = "A senha deve ter pelo menos 6 caracteres";
      return;
    }
    if (!/[A-Z]/.test(password)) {
      this.passwordErrorMessage = "A senha deve conter pelo menos uma letra maiúscula";
      return;
    }
    if (password2 === "") {
      this.passwordErrorMessage = "Confirme a senha";
      return;
    }

    if (password !== password2) {
      this.passwordErrorMessage = "As senhas não coincidem";
      return;
    }

    // Envia os dados para a API
    let response = await fetch("https://senai-gpt-api.azurewebsites.net/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        password: password
      })
    });

    console.log("Status code: " + response.status);

    if (response.status >= 200 && response.status <= 299) {
      this.sucessLogin = "Usuário criado com sucesso!";
      this.errorLogin = "";
      let json = await response.json();
      console.log("Resposta da API:", json);
      window.location.href = "login";
    } else {
      this.errorLogin = "Erro ao criar usuário. Tente novamente.";
      this.sucessLogin = "";
    }
  }
  goToLogin(){  
   this.router.navigate(['/login']); 
  }
}