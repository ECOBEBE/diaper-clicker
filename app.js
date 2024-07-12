const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const TELEGRAM_TOKEN = '7488038639:AAEQkt0iIq9YGAD8JimptOR3mEMp4xnvfAI';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.use(bodyParser.json());
app.use(express.static('public'));

let userCounters = {};  // Хранение счетчиков пользователей
let userUpgrades = {};  // Хранение улучшений пользователей

// Вебхук для получения сообщений от Telegram
app.post('/webhook', (req, res) => {
    const { message } = req.body;
    if (message && message.text) {
        handleMessage(message);
    }
    res.sendStatus(200);
});

// Обработка входящих сообщений
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text.toLowerCase();

    if (!userCounters[chatId]) {
        userCounters[chatId] = 0;
        userUpgrades[chatId] = { level: 1, rate: 1, cost: 100 };
    }

    if (text.includes('start')) {
        sendMessage(chatId, 'Добро пожаловать в Diaper Clicker! Нажмите /tap для производства подгузников.');
    } else if (text.includes('tap')) {
        userCounters[chatId] += userUpgrades[chatId].rate;
        sendMessage(chatId, `Вы произвели ${userCounters[chatId]} подгузников!`);
    } else if (text.includes('upgrade')) {
        if (userCounters[chatId] >= userUpgrades[chatId].cost) {
            userCounters[chatId] -= userUpgrades[chatId].cost;
            userUpgrades[chatId].level += 1;
            userUpgrades[chatId].rate *= 2;
            userUpgrades[chatId].cost *= 2;
            sendMessage(chatId, `Улучшение выполнено! Новый уровень: ${userUpgrades[chatId].level}, Производство: ${userUpgrades[chatId].rate} подгузников за клик.`);
        } else {
            sendMessage(chatId, `Недостаточно подгузников для улучшения. Требуется: ${userUpgrades[chatId].cost}.`);
        }
    } else {
        sendMessage(chatId, 'Используйте команды: /tap для производства подгузников, /upgrade для улучшения.');
    }
}

// Функция отправки сообщений в Telegram
async function sendMessage(chatId, text) {
    const fetch = (await import('node-fetch')).default;
    fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    });
}

// Установка вебхука
async function setWebhook() {
    const fetch = (await import('node-fetch')).default;
    fetch(`${TELEGRAM_API_URL}/setWebhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: 'https://diaper-clicker-app.herokuapp.com/webhook',
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('Webhook успешно установлен');
        } else {
            console.error('Ошибка установки webhook:', data.description);
        }
    });
}

setWebhook();

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

