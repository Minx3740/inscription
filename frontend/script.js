// Wizard multi-étapes
const steps = Array.from(document.querySelectorAll('.form-step'));
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('inscriptionForm');
const messageDiv = document.getElementById('message');
const resumeDiv = document.getElementById('resume');
let currentStep = 0;

function showStep(n) {
  steps.forEach((step, i) => {
    step.style.display = (i === n) ? 'block' : 'none';
  });
  prevBtn.style.display = n === 0 ? 'none' : 'inline-block';
  nextBtn.style.display = n === steps.length - 1 ? 'none' : 'inline-block';
  submitBtn.style.display = n === steps.length - 1 ? 'inline-block' : 'none';
  updateProgressBar(n);
  if (n === steps.length - 1) fillResume();
}

function updateProgressBar(n) {
  const percent = ((n + 1) / steps.length) * 100;
  progressBar.style.width = percent + '%';
}

function validateStep(n) {
  const inputs = steps[n].querySelectorAll('input, select');
  for (let input of inputs) {
    if (input.hasAttribute('required') && !input.value) {
      input.focus();
      return false;
    }
    // Validation conditionnelle pour classe/profession
    if (input.id === 'classe' && document.getElementById('statut').value === 'Etudiant' && !input.value) {
      input.focus();
      return false;
    }
    if (input.id === 'profession' && document.getElementById('statut').value === 'Travailleur' && !input.value) {
      input.focus();
      return false;
    }
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Veuillez remplir tous les champs obligatoires de cette étape.';
    return;
  }
  messageDiv.textContent = '';
  currentStep++;
  showStep(currentStep);
});

prevBtn.addEventListener('click', () => {
  messageDiv.textContent = '';
  currentStep--;
  showStep(currentStep);
});

function fillResume() {
  const data = new FormData(form);
  let html = '<ul style="text-align:left;">';
  for (let [key, value] of data.entries()) {
    if (key === 'classe' && document.getElementById('statut').value !== 'Etudiant') continue;
    if (key === 'profession' && document.getElementById('statut').value !== 'Travailleur') continue;
    if (key === 'statut') value = value === 'Etudiant' ? 'Étudiant' : (value === 'Travailleur' ? 'Travailleur' : value);
    html += `<li><b>${key.charAt(0).toUpperCase() + key.slice(1)} :</b> ${value || '-'}</li>`;
  }
  html += '</ul>';
  resumeDiv.innerHTML = html;
}

// Affichage conditionnel des champs classe/profession
window.toggleStatutFields = function() {
  const statut = document.getElementById('statut').value;
  document.getElementById('etudiantFields').style.display = (statut === 'Etudiant') ? 'block' : 'none';
  document.getElementById('classe').required = (statut === 'Etudiant');
  document.getElementById('travailleurFields').style.display = (statut === 'Travailleur') ? 'block' : 'none';
  document.getElementById('profession').required = (statut === 'Travailleur');
};

// Initialisation
showStep(0);
progressBarContainer.style.marginBottom = '18px';

// Soumission finale
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  submitBtn.disabled = true;
  messageDiv.textContent = 'Envoi en cours...';
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  // Champs conditionnels
  if (data.statut !== 'Etudiant') data.classe = '';
  if (data.statut !== 'Travailleur') data.profession = '';
  try {
    const response = await fetch('http://localhost:3001/api/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.status === 201) {
      messageDiv.style.color = 'green';
      messageDiv.textContent = result.message;
      form.reset();
      currentStep = 0;
      showStep(currentStep);
    } else {
      messageDiv.style.color = 'red';
      messageDiv.textContent = result.message;
    }
  } catch (err) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer plus tard.';
  }
  submitBtn.disabled = false;
}); 