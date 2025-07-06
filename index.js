const scriptURL = 'https://script.google.com/macros/s/AKfycbwX_o55Qs-tHPsKJ4y0-ptO3fefYyWdT087jc49-DQBq3nQU-ASGf41ksxdieBb70Yk/exec'

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
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("Erreur lors de l'accès à la caméra : " + err.message);
  }
});

takePhotoButton.addEventListener('click', () => {
  if (!stream) return alert("Caméra non démarrée !");
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/jpeg');
  imageInput.value = imageData.split(',')[1]; // base64 sans préfixe

  // ➕ Mise à jour de l'aperçu
  const photoPreview = document.getElementById('photo-preview');
  photoPreview.src = imageData;
  photoPreview.style.display = 'block';

  alert("📸 Photo capturée !");
});


form.addEventListener('submit', e => {
  e.preventDefault();

  const canvas = document.getElementById('canvas');
  const imageInput = document.getElementById('image-data');

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
  .then(response => alert("✅ Merci ! Formulaire envoyé."))
  .then(() => window.location.reload())
  .catch(error => console.error('❌ Erreur!', error.message));
});

