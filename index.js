const scriptURL = 'https://script.google.com/macros/s/AKfycbyG5OQnVSZ9gXSK14fBlgYAG1lJgWbA2IrmBAY-GD8OY4zCurYPWFZVd9Hm2PRi78b3/exec'

const form = document.forms['contact-form'];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const imageInput = document.getElementById('image-data');
const startCameraButton = document.getElementById('start-camera');
const takePhotoButton = document.getElementById('take-photo');

let stream = null;

// 🎥 Démarrer la webcam
startCameraButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } } // Caméra arrière
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Erreur lors de l'accès à la caméra arrière. Caméra frontale utilisée à la place.");

    // Fallback : caméra frontale si arrière indisponible
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true }); // Caméra frontale
      video.srcObject = stream;
    } catch (err2) {
      alert("Impossible d'accéder à la caméra : " + err2.message);
    }
  }
});

takePhotoButton.addEventListener('click', () => {
  if (!stream) return alert("Caméra non démarrée !");
  
  // Adapter dynamiquement la taille du canvas à celle de la vidéo
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, videoWidth, videoHeight);

  const imageData = canvas.toDataURL('image/jpeg');
  imageInput.value = imageData.split(',')[1]; // base64 sans préfixe

  // Aperçu de l'image capturée
  const photoPreview = document.getElementById('photo-preview');
  photoPreview.src = imageData;
  photoPreview.style.display = 'block';

  alert("📸 Photo capturée !");
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const canvas = document.getElementById('canvas');
  const imageInput = document.getElementById('image-data');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Afficher le loading
  loadingOverlay.classList.add('show');

  // Si la caméra a été utilisée, prendre la photo dans le champ caché
  if (canvas && imageInput && canvas.toDataURL) {
    const imageData = canvas.toDataURL('image/jpeg');
    imageInput.value = imageData.split(',')[1]; // base64 sans préfixe
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
    loadingOverlay.classList.remove('show'); // cacher même en cas d'erreur
  });
});

