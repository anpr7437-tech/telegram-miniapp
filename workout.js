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

let baseHeadY = null; // положение головы стоя
let state = 'up'; // up | down

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

  // НОС (ГОЛОВА)
  const nose = res.poseLandmarks[0];

  // Запоминаем положение стоя
  if (baseHeadY === null) {
    baseHeadY = nose.y;
    statusEl.innerText = 'Стой ровно. Начинай приседать';
    return;
  }

  const diff = nose.y - baseHeadY;

  // Показываем движение (чтобы ты ВИДЕЛ)
  statusEl.innerText = Движение головы: ${diff.toFixed(2)};

  // ВНИЗ (присел)
  if (diff > 0.08 && state === 'up') {
    state = 'down';
  }

  // ВВЕРХ (засчитали)
  if (diff < 0.03 && state === 'down') {
    reps++;
    repsEl.innerText = Повторы: ${reps};
    state = 'up';
  }
});

// ===== НАЧАТЬ =====
startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
  baseHeadY = null;
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
