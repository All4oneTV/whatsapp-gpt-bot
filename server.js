const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/webhook", async (req, res) => {
  const message = req.body.message?.body;
  const from = req.body.message?.from;

  if (!message || !from) return res.sendStatus(400);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du bist ein freundlicher Kunden-Support-Bot für IPTV-Dienste." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    await axios.post(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      token: process.env.ULTRAMSG_TOKEN,
      to: from,
      body: reply
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Fehler beim Antworten:", err.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp GPT Bot läuft ✅");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server läuft auf Port " + port);
});