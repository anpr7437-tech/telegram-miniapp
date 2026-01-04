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
let down = false;

// ===== ФУНКЦИЯ УГЛА (КОЛЕНО) =====
function calcAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x  2 + ab.y  2) * Math.sqrt(cb.x  2 + cb.y  2);

  return Math.acos(dot / mag) * 180 / Math.PI;
}

// ===== MEDIAPIPE POSE =====
const pose = new Pose({
  locateFile: file =>
    https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(results => {
  if (!active || !results.poseLandmarks) return;

  // ЛЕВАЯ НОГА
  const hip = results.poseLandmarks[23];
  const knee = results.poseLandmarks[25];
  const ankle = results.poseLandmarks[27];

  const angle = calcAngle(hip, knee, ankle);

  // ВНИЗ
  if (angle < 90) {
    down = true;
  }

  // ВВЕРХ = +1 ПРИСЕД
  if (angle > 160 && down) {
    reps++;
    repsEl.innerText = Повторы: ${reps};
    down = false;
  }
});

// ===== НАЧАТЬ ПОДХОД =====
startBtn.onclick = async () => {
  statusEl.innerText = 'Запрос камеры...';
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
  active = true;
  down = false;

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

  statusEl.innerText = 'Считаю приседания';
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
