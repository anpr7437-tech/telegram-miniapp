// ЭЛЕМЕНТЫ
const video = document.getElementById('video');
const button = document.getElementById('start');
const status = document.getElementById('status');

let stream = null;

// ПРОВЕРКА: JS ЗАГРУЗИЛСЯ
status.innerText = 'JS загружен. Нажми кнопку';

// КНОПКА
button.onclick = async () => {
  status.innerText = 'Кнопка нажата. Запрашиваю камеру...';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    status.innerText = 'Камера ВКЛЮЧЕНА ✅';
  } catch (err) {
    status.innerText = 'Ошибка камеры ❌';
    alert(err.message);
  }
};
