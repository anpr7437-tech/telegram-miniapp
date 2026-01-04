const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const repsEl = document.getElementById('reps');
const statusEl = document.getElementById('status');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let active = false;
let reps = 0;

let lastFrame = null;
let state = 'up';

function getFrameDiff(a, b) {
  let diff = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    diff += Math.abs(a.data[i] - b.data[i]);
  }
  return diff / a.data.length;
}

function processFrame() {
  if (!active) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (lastFrame) {
    const diff = getFrameDiff(frame, lastFrame);
    statusEl.innerText = Движение: ${diff.toFixed(2)};

    if (diff > 12 && state === 'up') {
      state = 'down';
    }

    if (diff < 6 && state === 'down') {
      reps++;
      repsEl.innerText = Повторы: ${reps};
      state = 'up';
    }
  }

  lastFrame = frame;
  requestAnimationFrame(processFrame);
}

startBtn.onclick = async () => {
  reps = 0;
  repsEl.innerText = 'Повторы: 0';
  state = 'up';
  lastFrame = null;
  active = true;

  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();

  statusEl.innerText = 'Камера включена';
  startBtn.disabled = true;
  stopBtn.disabled = false;

  processFrame();
};

stopBtn.onclick = () => {
  active = false;
  if (stream) stream.getTracks().forEach(t => t.stop());
  statusEl.innerText = Готово. Повторы: ${reps};
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
