# Senai GPT Web (Angular)

Aplicação web em Angular para autenticação de usuários e chat com IA, consumindo uma API hospedada no Azure. Inclui tela de login e cadastro, listagem de chats, troca de mensagens e modo escuro. Projeto publicado na Vercel.

## Link do Projeto

- Acesse: https://senai-gpt-angular.vercel.app/login

### Usuário para teste

   - e-mail: front@email.com
   - senha: frontdomina

## Demonstração

<img height="939" alt="image" src="https://github.com/user-attachments/assets/734545ca-b16e-4e97-9946-5f0b323d5bfa" />

## Tecnologias

- Angular 20 (standalone components)
- TypeScript 5.8
- Angular Router (rotas e `CanActivate` guard)
- Reactive Forms (login e cadastro)
- HttpClient + Interceptor (tratamento de 401)
- Deploy: Vercel (frontend) | Backend: Azure App Service

## Funcionalidades

- Autenticação com armazenamento de token em `localStorage` (`meuToken`, `meuId`).
- Proteção de rota `/chat` via guard (`src/app/auth.guard.ts`).
- Chat com listagem de conversas e mensagens persistidas pela API.
- Chamadas ao endpoint `/chat-completion` para obter resposta da IA (modelo Gemini via backend).
- Modo escuro e persistência de preferências no `localStorage`.

## Endpoints Consumidos (Backend)

Base URL: `https://senai-gpt-api.azurewebsites.net`

- `POST /login` – autenticação
- `POST /users` – cadastro de usuário
- `GET /chats`, `POST /chats`, `DELETE /chats/:id`
- `GET /messages?chatId=...`, `POST /messages`, `DELETE /messages/:id`
- `POST /chat-completion` – resposta da IA

## Requisitos

- Node.js 18.19+ (ou 20.x recomendado)
- npm 9+

## Como Rodar Localmente

1) Instale as dependências:
```
npm install
```
2) Inicie o servidor de desenvolvimento:
```
npm run start
```
3) Acesse `http://localhost:4200/`.

Dicas:
- Crie um usuário em `/new-user` e faça login em `/login` para acessar `/chat`.
- O token é salvo automaticamente no `localStorage` após login.

## Build

```
npm run build
```
Os artefatos serão gerados em `dist/` conforme `angular.json`.

## Scripts Disponíveis

- `npm start` – `ng serve` (dev)
- `npm run build` – build de produção
- `npm run watch` – build em modo watch (dev)
- `npm test` – testes unitários (Karma + Jasmine)

## Estrutura (Resumo)

- `src/app/app.routes.ts` – definição das rotas
- `src/app/auth.guard.ts` – guard de autenticação
- `src/app/user-module/login-screen/` – tela de login
- `src/app/user-module/new-user-screen/` – tela de cadastro
- `src/app/chat-module/chat-screen/` – tela do chat e `chat-service.ts`
- `src/app/interfaces/gemini-response.ts` – tipos da resposta da IA

## Observações

- A URL da API está fixa no frontend em `chat-service.ts` e no login (fetch). Ajuste para ambientes diferentes se necessário.
- O interceptor redireciona para `/login` em respostas `401` e limpa o `localStorage`.
