require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://main--test-app-frontend.netlify.app'
}));


bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, "Choose option:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Cart", web_app: { url: 'https://main--test-app-frontend.netlify.app/product_list' } }],
          [{ text: "Form", web_app: { url: 'https://main--test-app-frontend.netlify.app/form' } }]
        ],
      },
    });
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Thanks for the feedback");
      await bot.sendMessage(chatId, "Your country is: " + data?.country);
      await bot.sendMessage(chatId, "Your street is: " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, "All info you receive in chat.");
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  console.log('Received request:', req.body); // Логування запиту
  const { queryID, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryID, {
      type: 'article',
      id: queryID,
      title: "Successful purchase",
      input_message_content: { message_text: "You purchase goods for the amount: " + totalPrice }
    });
    res.status(200).send('Query answered successfully');
  } catch (e) {
    console.error('Error answering query:', e);
    await bot.answerWebAppQuery(queryID, {
      type: 'article',
      id: queryID,
      title: "Failed to purchase item",
      input_message_content: { message_text: "Failed to purchase item" }
    });
    res.status(500).send('Failed to answer query');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
