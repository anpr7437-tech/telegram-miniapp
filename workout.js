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
let state = 'up'; // up | down

// ===== ФУНКЦИЯ УГЛА =====
function angle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x  2 + ab.y  2) *
              Math.sqrt(cb.x  2 + cb.y  2);
  return Math.acos(dot / mag) * 180 / Math.PI;
}

// ===== MEDIAPIPE =====
const pose = new Pose({
  locateFile: f => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(res => {
  if (!active || !res.poseLandmarks) return;

  // Левая нога
  const hip = res.poseLandmarks[23];
  const knee = res.poseLandmarks[25];
  const ankle = res.poseLandmarks[27];

  const a = angle(hip, knee, ankle);

  // ПОКАЗЫВАЕМ УГОЛ (ОЧЕНЬ ВАЖНО)
  statusEl.innerText = Угол колена: ${Math.round(a)}°;

  // ВНИЗ
  if (a < 120 && state === 'up') {
    state = 'down';
  }

  // ВВЕРХ = ПРИСЕД ЗАСЧИТАН
  if (a > 150 && state === 'down') {
    reps++;
    repsEl.innerText = Повторы: ${reps};
    state = 'up';
  }
});

// ===== НАЧАТЬ =====
startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
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
