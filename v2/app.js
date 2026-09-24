const rotationScene = document.querySelector('[data-name="Rotación"]');
const flexibilityScene = document.querySelector('[data-name="Flexibilidad"]');
rotationScene.after(flexibilityScene);
const scenes = Array.from(document.querySelectorAll('.scene'));
scenes.slice(1).forEach((scene, index) => {
  const label = scene.querySelector('.overline');
  if (label) label.textContent = label.textContent.replace(/^\d{2}\s*\//, `${String(index + 1).padStart(2, '0')} /`);
});
const backButton = document.getElementById('back');
const forwardButton = document.getElementById('forward');
const count = document.getElementById('count');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');

const originalMaximumStep = scene => Math.max(0, ...Array.from(scene.querySelectorAll('[data-reveal]'), element => Number(element.dataset.reveal)));
const maximumStep = scene => Math.min(2, originalMaximumStep(scene));
const revealStep = (scene, element) => {
  const original = originalMaximumStep(scene);
  return original <= 2 ? Number(element.dataset.reveal) : Math.ceil(Number(element.dataset.reveal) * 2 / original);
};
const sceneSteps = scenes.map(scene => maximumStep(scene) + 1);
const totalSteps = sceneSteps.reduce((sum, steps) => sum + steps, 0);
let currentScene = 0;
let currentStep = 0;
let touchStartX = 0;
let touchStartY = 0;

function render() {
  document.getElementById('deck').dataset.theme = scenes[currentScene].classList.contains('light') || scenes[currentScene].classList.contains('warm') || scenes[currentScene].classList.contains('coral') ? 'light' : 'dark';
  scenes.forEach((scene, sceneIndex) => {
    const active = sceneIndex === currentScene;
    scene.classList.toggle('active', active);
    scene.classList.toggle('left', sceneIndex < currentScene);
    scene.setAttribute('aria-hidden', String(!active));
    scene.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.toggle('shown', active && revealStep(scene, element) <= currentStep);
    });
  });
  const passed = sceneSteps.slice(0, currentScene).reduce((sum, steps) => sum + steps, 0) + currentStep + 1;
  count.textContent = `${String(currentScene + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
  progressBar.style.width = `${passed / totalSteps * 100}%`;
  backButton.disabled = currentScene === 0 && currentStep === 0;
  forwardButton.disabled = currentScene === scenes.length - 1 && currentStep === maximumStep(scenes[currentScene]);
  progressLabel.textContent = `${scenes[currentScene].dataset.name} · idea ${currentStep + 1} de ${sceneSteps[currentScene]}`;
}

function move(direction) {
  if (direction > 0) {
    if (currentStep < maximumStep(scenes[currentScene])) currentStep++;
    else if (currentScene < scenes.length - 1) { currentScene++; currentStep = 0; }
  } else {
    if (currentStep > 0) currentStep--;
    else if (currentScene > 0) { currentScene--; currentStep = maximumStep(scenes[currentScene]); }
  }
  render();
}

backButton.addEventListener('click', () => move(-1));
forwardButton.addEventListener('click', () => move(1));
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) { event.preventDefault(); move(1); }
  if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); move(-1); }
  if (event.key === 'Home') { event.preventDefault(); currentScene = 0; currentStep = 0; render(); }
  if (event.key === 'End') { event.preventDefault(); currentScene = scenes.length - 1; currentStep = maximumStep(scenes[currentScene]); render(); }
});
document.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });
document.addEventListener('touchend', event => {
  const deltaX = event.changedTouches[0].screenX - touchStartX;
  const deltaY = event.changedTouches[0].screenY - touchStartY;
  if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)) move(deltaX < 0 ? 1 : -1);
}, { passive: true });
render();
