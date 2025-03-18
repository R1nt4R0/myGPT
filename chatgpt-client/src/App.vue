<template>
  <div class="app-container">
    <div class="history-panel">
      <h2>Historique</h2>
      <button class="new-chat-button" @click="newConversation">+ Nouvelle Discussion</button>
      <ul>
        <li v-for="(conv, index) in history" :key="conv._id" class="history-item">
          <span class="history-title" @click="loadConversation(conv)">{{ conv._id.slice(-6) }} - {{ conv.messages[0]?.content.slice(0, 20) || 'Nouvelle conversation' }}...</span>
          <button class="delete-button" @click="deleteConversation(conv._id)">🗑</button>
        </li>
      </ul>
    </div>
    <div class="chat-section">
      <h1 class="title">Mon ChatGPT</h1>
      <div class="chat-box">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <span class="message-content">{{ msg.content }}</span>
          <button v-if="msg.reasoning" class="reasoning-button" @click="toggleReasoning(index)">💡 Raisonnement</button>
          <p v-if="msg.showReasoning" class="reasoning-text">{{ msg.reasoning }}</p>
        </div>
      </div>
      <div class="input-container">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Tapez votre message..." class="chat-input">
        <button @click="sendMessage" class="send-button">Envoyer</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      newMessage: '',
      messages: [],
      history: []
    };
  },
  methods: {
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      const userMessage = { role: 'user', content: this.newMessage };
      this.messages.push(userMessage);

      try {
        const response = await axios.post('http://localhost:5000/chat', { message: this.newMessage });
        let reply = response.data.reply;
        let reasoning = '';

        // Séparer la réponse et le raisonnement (avant </think>)
        if (reply.includes('</think>')) {
          const parts = reply.split('</think>');
          reasoning = parts[0].trim();
          reply = parts[1].trim();
        }

        this.messages.push({ role: 'bot', content: reply, reasoning, showReasoning: false });
      } catch (error) {
        console.error('Erreur en envoyant le message:', error);
      }
      this.newMessage = '';
    },
    async fetchHistory() {
      try {
        const response = await axios.get('http://localhost:5000/history');
        this.history = response.data;
      } catch (error) {
        console.error('Erreur en récupérant l\'historique:', error);
      }
    },
    loadConversation(conversation) {
      this.messages = conversation.messages.map(msg => ({ ...msg, showReasoning: false }));
    },
    newConversation() {
      this.messages = [];
    },
    async deleteConversation(id) {
      try {
        await axios.delete(`http://localhost:5000/history/${id}`);
        this.history = this.history.filter(conv => conv._id !== id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    },
    toggleReasoning(index) {
      this.messages[index].showReasoning = !this.messages[index].showReasoning;
    }
  },
  mounted() {
    this.fetchHistory();
  }
};
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}
.history-panel {
  width: 20%;
  background: #343a40;
  color: white;
  padding: 20px;
  overflow-y: auto;
  border-right: 2px solid #ddd;
}
.new-chat-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.new-chat-button:hover {
  background: #218838;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #495057;
  cursor: pointer;
  font-size: 14px;
}
.history-item:hover {
  background: #495057;
}
.history-title {
  font-weight: bold;
  color: #f8f9fa;
  flex-grow: 1;
}
.delete-button {
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 16px;
}
.delete-button:hover {
  color: darkred;
}
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}
.chat-box {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  height: 70vh;
  overflow-y: auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 80%;
  max-width: 900px;
}
.reasoning-button {
  background: #f39c12;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
}
.reasoning-button:hover {
  background: #e67e22;
}
.reasoning-text {
  font-size: 14px;
  color: #555;
  background: #f9f9f9;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
}
</style>
