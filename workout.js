// ===== ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');

// ===== СОСТОЯНИЕ =====
let stream = null;

// ===== НАЧАТЬ ПОДХОД =====
startBtn.onclick = async () => {
  statusEl.innerText = 'Запрос камеры...';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;

    // 🔥 КРИТИЧНО ДЛЯ iPHONE
    await video.play();

    statusEl.innerText = 'Камера работает';

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    statusEl.innerText = 'Ошибка камеры';
    alert('Ошибка камеры: ' + err.message);
  }
};

// ===== ЗАВЕРШИТЬ ПОДХОД =====
stopBtn.onclick = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }

  statusEl.innerText = 'Камера остановлена';

  startBtn.disabled = false;
  stopBtn.disabled = true;
};
