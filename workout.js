const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');

let stream = null;

startBtn.onclick = async () => {
  statusEl.innerText = 'Запрос камеры...';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;

    // КРИТИЧЕСКИ ВАЖНО ДЛЯ iPHONE
    await video.play();

    statusEl.innerText = 'Камера работает';

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (e) {
    statusEl.innerText = 'Ошибка камеры';
    alert('Ошибка: ' + e.message);
  }
};

stopBtn.onclick = () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }

  statusEl.innerText = 'Камера остановлена';
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
