// ===== ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');
const repsEl = document.getElementById('reps');

// ===== СОСТОЯНИЕ =====
let stream = null;
let reps = 0;

// ===== ПРОВЕРКА: JS ЖИВ =====
statusEl.innerText = 'JS загружен. Нажми "Начать подход"';

// ===== КНОПКА НАЧАТЬ =====
startBtn.onclick = async () => {
  statusEl.innerText = 'Кнопка нажата';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;
    await video.play();

    statusEl.innerText = 'Камера включена';
    repsEl.innerText = 'Повторы: 0';

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (e) {
    statusEl.innerText = 'Ошибка камеры';
    alert(e.message);
  }
};

// ===== КНОПКА СТОП =====
stopBtn.onclick = () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }

  statusEl.innerText = 'Остановлено';
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
