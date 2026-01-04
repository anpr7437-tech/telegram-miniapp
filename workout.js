// ===== TELEGRAM =====
const tg = Telegram.WebApp;
tg.expand();

// ===== HTML ЭЛЕМЕНТЫ =====
const video = document.getElementById('video');
const repsEl = document.getElementById('reps');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

// ===== СОСТОЯНИЕ =====
let reps = 0;
let active = false;
let down = false;
let cameraStarted = false;

// ===== ФУНКЦИЯ УГЛА (КОЛЕНО) =====
function calcAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x  2 + ab.y  2);
  const magCB = Math.sqrt(cb.x  2 + cb.y  2);

  let angle = Math.acos(dot / (magAB * magCB));
  return angle * (180 / Math.PI);
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
  if (!active) return;
  if (!results.poseLandmarks) return;

  // Левая нога
  const hip = results.poseLandmarks[23];
  const knee = results.poseLandmarks[25];
  const ankle = results.poseLandmarks[27];

  const angle = calcAngle(hip, knee, ankle);

  // Вниз
  if (angle < 90) {
    down = true;
  }

  // Вверх = 1 повтор
  if (angle > 160 && down) {
    reps++;
    repsEl.innerText = reps;
    down = false;
  }
});

// ===== КАМЕРА (НО НЕ ЗАПУСКАЕМ СРАЗУ) =====
const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});

// ===== КНОПКА: НАЧАТЬ ПОДХОД =====
startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 0;
  active = true;
  down = false;

  if (!cameraStarted) {
    await camera.start(); // 🔥 КАМЕРА ЗАПУСКАЕТСЯ ТОЛЬКО ТУТ
    cameraStarted = true;
  }

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// ===== КНОПКА: ЗАВЕРШИТЬ ПОДХОД =====
stopBtn.onclick = async () => {
  active = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;

  // Отправляем данные на сервер
  try {
    await fetch('/api/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: tg.initDataUnsafe.user.id,
        exercise: 'squat',
        reps: reps,
        time: new Date().toISOString()
      })
    });
  } catch (e) {
    console.log('Ошибка отправки:', e);
  }

  alert(`Подход завершён!\nПовторы: ${reps}`);
};
