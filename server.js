const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/webhook", async (req, res) => {
  const userMessage = req.body.Body;
  const fromNumber = req.body.From;

  const openaiRes = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [{ role: "user", content: userMessage }]
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const gptResponse = openaiRes.data.choices[0].message.content;

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    new URLSearchParams({
      Body: gptResponse,
      From: `whatsapp:${process.env.TWILIO_NUMBER}`,
      To: fromNumber
    }),
    {
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      }
    }
  );

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Bot läuft auf Port 3000"));