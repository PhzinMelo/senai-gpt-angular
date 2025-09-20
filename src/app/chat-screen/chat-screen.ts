import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Interface que define o formato de um Chat
interface IChat {
  chatTitle: string;
  id: number;
  userId: string;
}

// Interface que define o formato de uma Mensagem
interface IMessage {
  chatId: number;
  id: number;
  text: string;
  userId: string;
}

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-screen.html',
  styleUrl: './chat-screen.css'
})
export class ChatScreen {
  // Lista de chats carregados da API
  chats: IChat[] = [];

  // Chat atualmente selecionado pelo usuário
  chatSelecionado: IChat | null = null;

  // Lista de mensagens do chat selecionado
  mensagens: IMessage[] = [];

  // Controle do campo de texto onde o usuário digita a mensagem
  mensagemUsuario = new FormControl("");

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  // Executado automaticamente quando o componente é carregado
  ngOnInit() {
    this.getChats(); // Carrega a lista de chats do usuário
  }

  // Busca os chats da API
  async getChats() {
    try {
      // Requisição para obter os chats
      let response = await firstValueFrom(
        this.http.get("https://senai-gpt-api.azurewebsites.net/chats", {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        })
      ) as IChat[];

      // Filtra os chats do usuário logado
      const userId = localStorage.getItem("meuId");
      response = response.filter(chat => chat.userId === userId);

      // Salva na lista
      this.chats = response;
    } catch (error) {
      console.error("Erro ao buscar os chats:", error);
    }
  }

  // Quando o usuário clica em um chat
  async onChatClick(chatClicado: IChat) {
    // Define o chat selecionado
    this.chatSelecionado = chatClicado;

    try {
      // Busca mensagens do chat selecionado
      const response = await firstValueFrom(
        this.http.get("https://senai-gpt-api.azurewebsites.net/messages?chatId=" + chatClicado.id, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        })
      );

      // Atualiza a lista de mensagens
      this.mensagens = response as IMessage[];
      this.cd.detectChanges(); // Atualiza a tela
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  }

  // Envia mensagem do usuário e recebe resposta da IA
  async enviarMensagem() {
    // Verifica se tem um chat selecionado e se a mensagem não está vazia
    if (!this.chatSelecionado || !this.mensagemUsuario.value?.trim()) {
      console.warn("Chat não selecionado ou mensagem vazia.");
      return;
    }

    // Pega o texto da mensagem digitada
    const mensagemDoUsuario = this.mensagemUsuario.value.trim();

    // Monta o objeto da nova mensagem para enviar para a API
    const novaMensagemUsuario = {
      chatId: this.chatSelecionado.id,
      userId: localStorage.getItem("meuId"),
      text: mensagemDoUsuario
    };

    try {
      // Envia a mensagem do usuário
      await firstValueFrom(
        this.http.post(
          "https://senai-gpt-api.azurewebsites.net/messages",
          novaMensagemUsuario,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      // Limpa o campo de input
      this.mensagemUsuario.setValue("");

      // Atualiza a conversa com as novas mensagens
      await this.onChatClick(this.chatSelecionado);

      // Envia a mensagem para o Gemini e recebe a resposta da IA
      const respostaIAResponse = await firstValueFrom(this.http.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: mensagemDoUsuario
                }
              ]
            }
          ]
        },
        {
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": "AIzaSyDV2HECQZLpWJrqCKEbuq7TT5QPKKdLOdo"
          }
        }
      )) as any;

      // Cria a mensagem da IA
      const novaRespostaIA = {
        chatId: this.chatSelecionado.id,
        userId: "chatbot",
        text: respostaIAResponse.candidates[0].content.parts[0].text
      };

      // Salva a resposta da IA
      await firstValueFrom(this.http.post(
        "https://senai-gpt-api.azurewebsites.net/messages",
        novaRespostaIA,
        {
          headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        }
      ));

      // Atualiza novamente a tela com a resposta da IA
      await this.onChatClick(this.chatSelecionado);
    } catch (error) {
      console.error("Erro ao enviar mensagem ou obter resposta da IA:", error);
    }
  }

  logout() {
  // Limpa o localStorage
  localStorage.removeItem("meuToken");
  localStorage.removeItem("meuId");

  // Redireciona para a página de login
  window.location.href = "login"; // ou o caminho correto do seu projeto
}
  // Cria um novo chat
  async novoChat() {
    const nomeChat = prompt("Digite o nome do novo chat");

    // Verifica se foi digitado um nome válido
    if (!nomeChat) {
      alert('Nome inválido');
      return;
    }

    // Monta o objeto do novo chat
    const novoChatObj = {
      chatTitle: nomeChat,
      userId: localStorage.getItem("meuId")
    };

    try {
      // Envia o novo chat para a API
      const novoChatResponse = await firstValueFrom(
        this.http.post(
          "https://senai-gpt-api.azurewebsites.net/chats",
          novoChatObj,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      // Atualiza a lista de chats
      await this.getChats();

      // Seleciona automaticamente o novo chat criado
      this.chatSelecionado = novoChatResponse as IChat;
      await this.onChatClick(this.chatSelecionado);
    } catch (error) {
      console.error("Erro ao criar novo chat:", error);
      alert("Não foi possível criar o novo chat.");
    }
  }
}
