// ===== TELEGRAM (БЕЗ ПАДЕНИЯ) =====
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

// ===== ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const repsEl = document.getElementById('reps');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

let reps = 0;
let active = false;
let down = false;
let cameraStarted = false;

// ===== ПРОВЕРКА КНОПКИ =====
console.log('JS загружен');
startBtn.onclick = () => alert('Кнопка нажата (JS работает)');

// ===== УГОЛ =====
function angle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x**2 + ab.y**2) * Math.sqrt(cb.x**2 + cb.y**2);
  return Math.acos(dot / mag) * 180 / Math.PI;
}

// ===== MEDIAPIPE =====
const pose = new Pose({
  locateFile: f => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}
});

pose.onResults(res => {
  if (!active || !res.poseLandmarks) return;

  const hip = res.poseLandmarks[23];
  const knee = res.poseLandmarks[25];
  const ankle = res.poseLandmarks[27];

  const a = angle(hip, knee, ankle);

  if (a < 90) down = true;
  if (a > 160 && down) {
    reps++;
    repsEl.innerText = reps;
    down = false;
  }
});

// ===== КАМЕРА =====
const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});

// ===== НАЧАТЬ =====
startBtn.onclick = async () => {
  statusEl.innerText = 'Запуск камеры...';
  reps = 0;
  repsEl.innerText = 0;
  active = true;
  down = false;

  if (!cameraStarted) {
    await camera.start();
    cameraStarted = true;
  }

  statusEl.innerText = 'Камера работает';
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// ===== ЗАВЕРШИТЬ =====
stopBtn.onclick = async () => {
  active = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusEl.innerText = 'Подход завершён';

  if (tg) {
    fetch('/api/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: tg.initDataUnsafe?.user?.id || 0,
        exercise: 'squat',
        reps,
        time: new Date().toISOString()
      })
    });
  }

  alert(`Готово! Повторы: ${reps}`);
};
