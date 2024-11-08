import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import FormData from 'form-data';

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));

const TELEGRAM_TOKEN = '7245365629:AAFgKLW3cpThIE-epEOaAiSBRXRIxa7CL34';
const CHAT_ID = '2112768202';

app.post('/upload', async (req, res) => {
    console.log('Получен запрос на /upload');

    if (!req.body || !req.body.photo) {
        console.error('Отсутствуют данные изображения.');
        return res.status(400).json({ message: 'Отсутствуют данные изображения.' });
    }

    const dataUrl = req.body.photo;
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const photoBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', photoBuffer, {
        filename: 'photo.png',
        contentType: 'image/png'
    });

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()  // Не забудьте добавить заголовки для FormData
        });
        const data = await response.json();
        if (data.ok) {
            console.log('Фото успешно отправлено в Telegram');
            res.json({ message: 'Фото успешно отправлено в Telegram!' });
        } else {
            console.error('Ошибка отправки в Telegram:', data);
            res.status(500).json({ message: 'Ошибка отправки в Telegram.', error: data });
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса в Telegram:', error);
        res.status(500).json({ message: 'Ошибка при отправке запроса в Telegram.', error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
