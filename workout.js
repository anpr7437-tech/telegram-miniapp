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

// ===== MEDIAPIPE =====
const pose = new Pose({
  locateFile: f => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// ===== ГЛАВНОЕ: ПРОВЕРКА =====
pose.onResults(res => {
  if (!active) return;

  if (!res.poseLandmarks) {
    statusEl.innerText = 'MediaPipe: человек НЕ найден';
    return;
  }

  // НОС
  const nose = res.poseLandmarks[0];

  statusEl.innerText =
    MediaPipe РАБОТАЕТ ✅ | Нос: x=${nose.x.toFixed(2)} y=${nose.y.toFixed(2)};
});

// ===== СТАРТ =====
startBtn.onclick = async () => {
  statusEl.innerText = 'Запуск камеры...';
  active = true;

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

  statusEl.innerText = 'Остановлено';
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
