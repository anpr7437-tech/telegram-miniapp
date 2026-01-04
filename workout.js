const video = document.getElementById('video');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

let stream = null;

startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;
    alert('Камера включилась');

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (e) {
    alert('Ошибка камеры: ' + e.message);
  }
};

stopBtn.onclick = () => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }

  alert('Камера остановлена');
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
