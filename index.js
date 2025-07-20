const scriptURL = 'https://script.google.com/macros/s/AKfycbyG5OQnVSZ9gXSK14fBlgYAG1lJgWbA2IrmBAY-GD8OY4zCurYPWFZVd9Hm2PRi78b3/exec'

const form = document.forms['contact-form'];
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const imageInput = document.getElementById('image-data');
const cameraSelect = document.getElementById('camera-select');
const photoPreview = document.getElementById('photo-preview');
const takePhotoButton = document.getElementById('take-photo');
const photoControls = document.getElementById('photo-controls');
const loadingOverlay = document.getElementById('loading-overlay');
const retakePhotoButton = document.getElementById('retake-photo');


let stream = null;

// 🛑 Stopper une éventuelle ancienne caméra
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

// 🔍 Lister les caméras disponibles
async function listCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    cameraSelect.innerHTML = '<option value="">📷 Caméra par défaut (arrière si possible)</option>';

    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Caméra ${index + 1}`;
      cameraSelect.appendChild(option);
    });
  } catch (err) {
    alert("Erreur lors de la détection des caméras : " + err.message);
  }
}

// 🎥 Démarrer la caméra selon l’option sélectionnée
async function startCameraFromSelection(deviceId) {
  stopCamera();

  try {
    if (deviceId) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } }
        });
      } catch (error) {
        // Si la caméra arrière n’est pas disponible, utiliser la caméra frontale
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
      }
    }
    video.srcObject = stream;
  } catch (err) {
    alert("Erreur avec la caméra choisie. Caméra frontale utilisée à la place.");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (err2) {
      alert("Impossible d'accéder à la caméra : " + err2.message);
    }
  }
}

// 📸 Prendre une photo
takePhotoButton.addEventListener('click', () => {
  if (!stream) return alert("Caméra non démarrée !");

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, videoWidth, videoHeight);

  const imageData = canvas.toDataURL('image/jpeg');
  imageInput.value = imageData.split(',')[1];

  // ➕ Afficher la photo capturée
  video.style.display = 'none';
  photoPreview.src = imageData;
  photoPreview.style.display = 'block';

  // ➕ Afficher bouton "Reprendre"
  takePhotoButton.style.display = 'none';
  retakePhotoButton.style.display = 'inline-block';
});

// 🔁 Reprendre une photo
retakePhotoButton.addEventListener('click', async () => {
  photoPreview.style.display = 'none';
  video.style.display = 'block';

  // Relancer la caméra sélectionnée
  const selectedDeviceId = cameraSelect.value;
  await startCameraFromSelection(selectedDeviceId);

  // Réafficher les bons boutons
  takePhotoButton.style.display = 'inline-block';
  retakePhotoButton.style.display = 'none';

  // Réinitialiser l'image stockée
  imageInput.value = '';
});

// 📦 Envoi du formulaire
form.addEventListener('submit', e => {
  e.preventDefault();
  loadingOverlay.classList.add('show');

  // S'assurer qu'une image est bien prise
  if (canvas && imageInput && canvas.toDataURL) {
    const imageData = canvas.toDataURL('image/jpeg');
    imageInput.value = imageData.split(',')[1];
  }

  const formData = new FormData(form);

  fetch(scriptURL, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      alert("✅ Merci ! Formulaire envoyé.");
      window.location.reload();
    })
    .catch(error => {
      console.error('❌ Erreur!', error.message);
      alert("❌ Une erreur est survenue !");
    })
    .finally(() => {
      loadingOverlay.classList.remove('show');
    });
});

// ⚙️ Événement lors du changement de caméra
cameraSelect.addEventListener('change', () => {
  const selectedDeviceId = cameraSelect.value;
  startCameraFromSelection(selectedDeviceId);
});

// 🚀 Démarrage initial
window.addEventListener('DOMContentLoaded', () => {
  listCameras();
  startCameraFromSelection();
});
