const tg = Telegram.WebApp;
tg.expand();

const video = document.getElementById('video');
const repsEl = document.getElementById('reps');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

let reps = 0;
let active = false;
let down = false;

// считаем угол в колене
function angle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x**2 + ab.y**2) * Math.sqrt(cb.x**2 + cb.y**2);
  return Math.acos(dot / mag) * 180 / Math.PI;
}

// MediaPipe
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

// камера
const cam = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  }
});
cam.start();

startBtn.onclick = () => {
  reps = 0;
  repsEl.innerText = 0;
  active = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = async () => {
  active = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;

  await fetch('/api/workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: tg.initDataUnsafe.user.id,
      exercise: 'squat',
      reps,
      time: new Date().toISOString()
    })
  });

  alert('Подход завершён');
};