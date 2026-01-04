// ===== ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');
const repsEl = document.getElementById('reps');

// ===== СОСТОЯНИЕ =====
let stream = null;
let camera = null;
let active = false;
let reps = 0;
let baseHipY = null;
let state = 'up';

// ===== MEDIAPIPE =====
const pose = new Pose({
  locateFile: f => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

pose.onResults(res => {
  if (!active || !res.poseLandmarks) return;

  // ЛЕВЫЙ ТАЗ
  const hip = res.poseLandmarks[23];

  // Первый кадр — запоминаем положение стоя
  if (baseHipY === null) {
    baseHipY = hip.y;
    statusEl.innerText = 'Стой ровно. Начинай приседать';
    return;
  }

  const diff = hip.y - baseHipY;

  // ПОКАЗЫВАЕМ ДВИЖЕНИЕ (для понимания)
  statusEl.innerText = Смещение таза: ${diff.toFixed(2)};

  // ВНИЗ
  if (diff > 0.12 && state === 'up') {
    state = 'down';
  }

  // ВВЕРХ = ПОВТОР
  if (diff < 0.05 && state === 'down') {
    reps++;
    repsEl.innerText = Повторы: ${reps};
    state = 'up';
  }
});

// ===== НАЧАТЬ =====
startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
  baseHipY = null;
  state = 'up';
  active = true;

  statusEl.innerText = 'Запуск камеры...';

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' }
  });

  video.srcObject = stream;
  await video.play();

  camera = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// ===== СТОП =====
stopBtn.onclick = () => {
  active = false;

  if (camera) camera.stop();
  if (stream) stream.getTracks().forEach(t => t.stop());

  statusEl.innerText = Готово. Повторы: ${reps};
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
