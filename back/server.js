require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Modèle Conversation
const ConversationSchema = new mongoose.Schema({
  messages: [{ role: String, content: String }],
  createdAt: { type: Date, default: Date.now },
});
const Conversation = mongoose.model("Conversation", ConversationSchema);

// API Hugging Face
async function queryModel(inputText) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur API Hugging Face:", error);
    throw error;
  }
}

// Route pour envoyer un message
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message requis" });

  try {
    const response = await queryModel(message);
    const reply = response[0]?.generated_text || "Je n'ai pas compris.";

    // Sauvegarde en BDD
    const conversation = new Conversation({
      messages: [{ role: "user", content: message }, { role: "bot", content: reply }],
    });
    await conversation.save();

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour récupérer l'historique
app.get("/history", async (req, res) => {
  const conversations = await Conversation.find().sort({ createdAt: -1 });
  res.json(conversations);
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur en écoute sur le port ${PORT}`));
