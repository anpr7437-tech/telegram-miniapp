const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const info = document.getElementById('info');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let lastFrame = null;
let active = false;

// считаем разницу между кадрами
function frameDiff(a, b) {
  let diff = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    diff += Math.abs(a.data[i] - b.data[i]);
  }
  return diff / a.data.length;
}

function loop() {
  if (!active) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (lastFrame) {
    const diff = frameDiff(frame, lastFrame);
    info.innerText = Движение: ${diff.toFixed(2)};
  }

  lastFrame = frame;
  requestAnimationFrame(loop);
}

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();

  active = true;
  info.innerText = 'Камера включена';
  loop();
};
