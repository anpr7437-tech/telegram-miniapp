// ===== ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const repsEl = document.getElementById('reps');
const statusEl = document.getElementById('status');

// ===== СОСТОЯНИЕ =====
let stream = null;
let camera = null;
let active = false;
let reps = 0;

// для подсчёта
let baseY = null;   // положение головы стоя
let state = 'up';   // up | down

// ===== MEDIAPIPE =====
const pose = new Pose({
  locateFile: file =>
    https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

// ===== ОБРАБОТКА КАДРА =====
pose.onResults(results => {
  if (!active || !results.poseLandmarks) return;

  // НОС = голова
  const nose = results.poseLandmarks[0];

  // первый кадр — запоминаем положение стоя
  if (baseY === null) {
    baseY = nose.y;
    statusEl.innerText = 'Стой ровно. Начинай приседать';
    return;
  }

  const diff = nose.y - baseY;

  // показываем движение (чтобы ты ВИДЕЛ)
  statusEl.innerText = Движение головы: ${diff.toFixed(2)};

  // ВНИЗ
  if (diff > 0.08 && state === 'up') {
    state = 'down';
  }

  // ВВЕРХ = ЗАСЧИТАЛИ
  if (diff < 0.03 && state === 'down') {
    reps++;
    repsEl.innerText = Повторы: ${reps};
    state = 'up';
  }
});

// ===== НАЧАТЬ ПОДХОД =====
startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
  baseY = null;
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

// ===== ЗАВЕРШИТЬ ПОДХОД =====
stopBtn.onclick = () => {
  active = false;

  if (camera) camera.stop();
  if (stream) stream.getTracks().forEach(t => t.stop());

  statusEl.innerText = Готово. Повторы: ${reps};
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
