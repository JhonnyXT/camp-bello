/**
 * Singleton de audio del campamento.
 * Vive fuera del ciclo de vida de React — nunca se destruye ni se ve
 * afectado por StrictMode o cambios de ruta.
 */

let _audio = null;

export const getAudio = () => {
  if (!_audio) {
    _audio        = new Audio('/theme.mp3');
    _audio.loop   = true;
    _audio.volume = 0.35;
  }
  return _audio;
};

export const playAudio = () => {
  const audio = getAudio();
  // Si ya está reproduciendo, no volver a llamar play()
  if (!audio.paused) return Promise.resolve();
  return audio.play().catch(() => {});
};

export const toggleMute = () => {
  const audio = getAudio();
  audio.muted = !audio.muted;
  return audio.muted;
};

export const isPlaying = () => {
  if (!_audio) return false;
  return !_audio.paused;
};
