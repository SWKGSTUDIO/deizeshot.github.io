const ws = new WebSocket('wss://intermediate-easy-ship.glitch.me');

ws.onopen = () => {
  console.log('Connected to the WebSocket server.');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'chat-history') {
    const history = data.messages;
    // Очищаем текущий чат перед отображением истории сообщений
    document.getElementById('chatMessages').innerHTML = '';
    history.forEach(message => displayMessage(message));
  } else if (data.type === 'chat-message') {
    const message = data.message;
    displayMessage(message);
  }
};

// Обработчик события нажатия кнопки "ChatRefresh"
document.getElementById('chatRefreshButton').addEventListener('click', () => {
    // Очистим текущий чат перед обновлением
    document.getElementById('chatMessages').innerHTML = '';
    // Запросим историю чата заново с сервера
    ws.send(JSON.stringify({ type: 'get-chat-history' }));
  });

// Обработка команды /get-chat-history
if (parsedMessage.type === 'get-chat-history') {
    // Отправляем историю чата текущему клиенту
    ws.send(JSON.stringify({ type: 'chat-history', messages: messages.slice(-maxMessages) }));
  }

// Отображаем фейковое приветственное сообщение при открытии чата, если нет истории сообщений
if (document.getElementById('chatMessages').children.length === 0) {
  displayMessage({
    type: 'chat',
    text: 'Привет! Напиши /bot, чтобы отправить бетсигнал.',
    time: getTimeString(),
  });
}

function displayMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message');

  // Добавляем текст сообщения с пробелом и временем
  const messageTextWithTime = document.createElement('div');
  messageTextWithTime.textContent = message.text + ' ' + message.time;
  messageDiv.appendChild(messageTextWithTime);

  // Добавляем класс в зависимости от типа сообщения (отправленное или полученное)
  if (message.type === 'chat') {
    messageDiv.classList.add('sent'); // Здесь можно использовать класс 'received' для полученных сообщений
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция для получения текущего времени в формате "HH:mm"
function getTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    let messageText = messageInput.value.trim();
  
    if (messageText !== '') {
      // Проверяем, является ли сообщение командой /regtg
      if (messageText.toLowerCase() === '/regtg') {
        // Открываем чат с ботом в новой вкладке браузера
        window.open('tg://resolve?domain=decloudpay_bot', '_blank');
      } else {
        // Проверяем, содержит ли сообщение текст вида "/bot @username" и извлекаем @имя пользователя
        const usernameMatch = messageText.match(/@(\w+)/);
        if (usernameMatch) {
          const username = usernameMatch[1];
          messageText = messageText.replace(/@(\w+)/, ''); // Удаляем из сообщения текст с @именем пользователя
          sendMessageToServer({ type: 'chat', text: messageText, username: username });
        } else {
          sendMessageToServer({ type: 'chat', text: messageText });
        }
      }
  
      messageInput.value = '';
    }
  }

async function sendMessageToServer(message) {
  const currentTime = getTimeString(); // Получаем текущее время в формате "HH:mm"
  message.time = currentTime; // Добавляем поле "time" с текущим временем в объект сообщения

  ws.send(JSON.stringify(message));
}

// Обработчик события нажатия клавиши Enter
document.getElementById('messageInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// Пример отправки сообщения на сервер при клике на кнопку "Отправить"
document.getElementById('sendButton').addEventListener('click', sendMessage);

// Код на стороне клиента для обработки ссылки с протоколом tg://
function handleMessage(message) {
    const parsedMessage = JSON.parse(message);
  
    if (parsedMessage.type === 'chat-message') {
      const { text, time } = parsedMessage.message;
  
      // Проверяем, содержит ли сообщение ссылку с протоколом tg://
      if (text.includes("tg://")) {
        // Создаем ссылку и добавляем её в чат
        const linkText = "Нажмите здесь, чтобы начать диалог с ботом";
        const linkUrl = text.split(" ")[1];
        const link = `<a href="${linkUrl}">${linkText}</a>`;
  
        const messageElement = createChatMessageElement(`${time} ${link}`);
        chatMessages.appendChild(messageElement);
      } else {
        // Добавляем обычное сообщение в чат
        const messageElement = createChatMessageElement(`${time} ${text}`);
        chatMessages.appendChild(messageElement);
      }
    }
  }
  