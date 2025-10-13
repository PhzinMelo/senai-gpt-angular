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
  chats: IChat[] = [];
  chatSelecionado: IChat | null = null;
  mensagens: IMessage[] = [];
  mensagemUsuario = new FormControl("");
  darkMode: boolean = false;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getChats();

    const darkModeLocalStorage = localStorage.getItem("darkMode");
    if (darkModeLocalStorage === "true") {  
      this.darkMode = true;
      document.body.classList.toggle("dark-mode", this.darkMode);
    }
  }

  // 🔹 Busca apenas os chats do usuário logado
  async getChats() {
    try {
      const response = await firstValueFrom(
        this.http.get("https://senai-gpt-api.azurewebsites.net/chats", {  
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        })
      ) as IChat[];

      const userId = localStorage.getItem("meuId");
      this.chats = response.filter(chat => chat.userId === userId);

    } catch (error) {
      console.error("Erro ao buscar os chats:", error);
    }
  }

  async onChatClick(chatClicado: IChat) {
    this.chatSelecionado = chatClicado;

    try {
      const response = await firstValueFrom(
        this.http.get("https://senai-gpt-api.azurewebsites.net/messages?chatId=" + chatClicado.id, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("meuToken")
          }
        })
      );

      this.mensagens = response as IMessage[];
      this.cd.detectChanges();
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  }

  async enviarMensagem() {
    if (!this.chatSelecionado || !this.mensagemUsuario.value?.trim()) {
      console.warn("Chat não selecionado ou mensagem vazia.");
      return;
    }

    const mensagemDoUsuario = this.mensagemUsuario.value.trim();

    const novaMensagemUsuario = {
      chatId: this.chatSelecionado.id,
      userId: localStorage.getItem("meuId"),
      text: mensagemDoUsuario
    };

    try {
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

      this.mensagemUsuario.setValue("");
      await this.onChatClick(this.chatSelecionado);

      const respostaIAResponse = await firstValueFrom(this.http.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [
                { text: mensagemDoUsuario }
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

      const novaRespostaIA = {
        chatId: this.chatSelecionado.id,
        userId: "chatbot",
        text: respostaIAResponse.candidates[0].content.parts[0].text
      };

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

      await this.onChatClick(this.chatSelecionado);
    } catch (error) {
      console.error("Erro ao enviar mensagem ou obter resposta da IA:", error);
    }
  }

  logout() {
    localStorage.removeItem("meuToken");
    localStorage.removeItem("meuId");
    window.location.href = "login";
  }

  async novoChat() {
    const nomeChat = prompt("Digite o nome do novo chat");

    if (!nomeChat) {
      alert('Nome inválido');
      return;
    }

    const novoChatObj = {
      chatTitle: nomeChat,
      userId: localStorage.getItem("meuId")
    };

    try {
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

      await this.getChats();
      this.chatSelecionado = novoChatResponse as IChat;
      await this.onChatClick(this.chatSelecionado);
    } catch (error) {
      console.error("Erro ao criar novo chat:", error);
      alert("Não foi possível criar o novo chat.");
    }
  }

  ligarDesligarDarkMode() { 
    this.darkMode = !this.darkMode;
    document.body.classList.toggle("dark-mode", this.darkMode);
    localStorage.setItem("darkMode", this.darkMode.toString());
  }

  // ⚡ FUNÇÃO CORRIGIDA: Agora não recebe parâmetro e usa o chatSelecionado
  async deletarChat() {
    if (!this.chatSelecionado) {
      alert("Selecione um chat para deletar!");
      return;
    }

    const confirmacao = confirm(`Tem certeza que deseja deletar o chat "${this.chatSelecionado.chatTitle}"?`);
    if (!confirmacao) return;

    try {
      await firstValueFrom(
        this.http.delete(
          `https://senai-gpt-api.azurewebsites.net/chats/${this.chatSelecionado.id}`,
          {
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("meuToken")
            }
          }
        )
      );

      // Remove o chat da lista local
      this.chats = this.chats.filter(c => c.id !== this.chatSelecionado!.id);

      // Se o chat deletado era o selecionado, limpa a tela
      if (this.chatSelecionado) {
        this.chatSelecionado = null;
        this.mensagens = [];
      }

      alert("Chat deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar chat:", error);
      await this.getChats();
      this.chatSelecionado = null!;
      this.cd.detectChanges();
    }
  }
}