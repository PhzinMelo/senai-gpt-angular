import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Interfaces
interface IChat {
  _id: string;
  chatTitle: string;
}

interface IMessage {
  _id: string;
  chatId: string;
  text: string;
  role: "user" | "ai";
}

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-screen.html',
  styleUrl: './chat-screen.css'
})
export class ChatScreen implements OnInit {
  chats: IChat[] = [];
  chatSelecionado: IChat | null = null;
  mensagens: IMessage[] = [];
  mensagemUsuario = new FormControl("");

  // Flag que bloqueia envio duplo enquanto a IA está respondendo
  aguardandoResposta = false;

  darkMode: boolean = false;

  // [FIX 1] — URL base centralizada; troque pela URL do Render em produção
  API_URL = "http://localhost:3000";

  // Cabeçalho JWT reutilizável — evita repetição em cada chamada
  private get authHeaders() {
    return { Authorization: "Bearer " + localStorage.getItem("meuToken") };
  }

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

  // 🔹 Alternar dark mode
  ligarDesligarDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle("dark-mode", this.darkMode);
    localStorage.setItem("darkMode", this.darkMode.toString());
  }

  // 🔹 Buscar chats
  async getChats() {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/chats`, { headers: this.authHeaders })
      );

      // [FIX 2] — Backend retorna { data: { chats: [], count: N } }
      // Antes: response.data  →  Agora: response.data.chats
      this.chats = response.data.chats ?? [];

    } catch (error) {
      console.error("Erro ao buscar chats:", error);
    }
  }

  // 🔹 Selecionar chat e carregar mensagens
  async onChatClick(chat: IChat) {
    this.chatSelecionado = chat;

    try {
      // [FIX 3] — Rota corrigida: /messages?chatId=... → /messages/:chatId
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_URL}/messages/${chat._id}`, { headers: this.authHeaders })
      );

      // [FIX 4] — Backend retorna { data: { messages: [], pagination: {} } }
      // Antes: response.data  →  Agora: response.data.messages
      this.mensagens = response.data.messages ?? [];
      this.cd.detectChanges();

    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  }

  // 🔹 Enviar mensagem para a IA
  async enviarMensagem() {
    // Bloqueia se não há chat, input vazio ou já aguardando a IA
    if (!this.chatSelecionado || !this.mensagemUsuario.value?.trim() || this.aguardandoResposta) return;

    const texto = this.mensagemUsuario.value.trim();
    this.mensagemUsuario.setValue("");
    this.aguardandoResposta = true;

    // [FIX 5] — Exibe a mensagem do usuário imediatamente (UX otimista)
    // enquanto aguarda a resposta da IA, sem precisar de um POST extra
    const mensagemTemporariaUsuario: IMessage = {
      _id: "temp-" + Date.now(),
      chatId: this.chatSelecionado._id,
      text: texto,
      role: "user"
    };
    this.mensagens = [...this.mensagens, mensagemTemporariaUsuario];
    this.cd.detectChanges();

    try {
      // [FIX 6] — Rota corrigida: /ai → /ai/chat
      // [FIX 7] — Body corrigido: { text } → { message }
      // [FIX 8] — Removido o POST /messages duplicado:
      //           /ai/chat já salva a mensagem do usuário E a resposta da IA
      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.API_URL}/ai/chat`,
          { chatId: this.chatSelecionado._id, message: texto },
          { headers: this.authHeaders }
        )
      );

      // Substitui a lista com as mensagens reais vindas do backend
      // (descarta o item temporário adicionado acima)
      await this.onChatClick(this.chatSelecionado);

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      // Em caso de erro, remove a mensagem temporária para não confundir o usuário
      this.mensagens = this.mensagens.filter(m => m._id !== mensagemTemporariaUsuario._id);
      this.cd.detectChanges();

    } finally {
      this.aguardandoResposta = false;
    }
  }

  // 🔹 Criar novo chat
  async novoChat() {
    const nome = prompt("Digite o nome do chat");
    if (!nome) return;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.API_URL}/chats`,
          { chatTitle: nome },
          { headers: this.authHeaders }
        )
      );

      // [FIX 9] — Backend retorna { data: { chat: {} } }
      // Antes: response.data  →  Agora: response.data.chat
      const novoChat: IChat = response.data.chat;

      await this.getChats();
      this.chatSelecionado = novoChat;
      await this.onChatClick(novoChat);

    } catch (error) {
      console.error("Erro ao criar chat:", error);
    }
  }

  // 🔹 Deletar chat selecionado
  async deletarChat() {
    if (!this.chatSelecionado) {
      alert("Selecione um chat!");
      return;
    }

    const confirmacao = confirm(`Deseja deletar "${this.chatSelecionado.chatTitle}"?`);
    if (!confirmacao) return;

    try {
      await firstValueFrom(
        this.http.delete(
          `${this.API_URL}/chats/${this.chatSelecionado._id}`,
          { headers: this.authHeaders }
        )
      );

      this.chats = this.chats.filter(c => c._id !== this.chatSelecionado!._id);
      this.chatSelecionado = null;
      this.mensagens = [];

    } catch (error) {
      console.error("Erro ao deletar chat:", error);
    }
  }

  // 🔹 Logout
  logout() {
    localStorage.removeItem("meuToken");
    localStorage.removeItem("meuId");
    window.location.href = "login";
  }
}
