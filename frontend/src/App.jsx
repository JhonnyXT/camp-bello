import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import CashCounter from "./components/CashCounter";
import Home from "./components/Home";
import { Landing } from "./components/Landing";
import { SoldierSelection } from "./components/SoldierSelection";
import { CampaignMap } from "./components/CampaignMap";
import { CommandPanel } from "./components/CommandPanel";
import { getAudio, toggleMute } from "./utils/audio";

// Botón flotante de mute — aparece solo cuando el audio está reproduciéndose
const AudioToggle = () => {
  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);

  useEffect(() => {
    const audio   = getAudio();
    const onPlay        = () => setPlaying(true);
    const onPause       = () => setPlaying(false);
    const onVolumeChange = () => setMuted(audio.muted);
    audio.addEventListener('play',         onPlay);
    audio.addEventListener('pause',        onPause);
    audio.addEventListener('volumechange', onVolumeChange);
    // Sincronizar estado inicial
    setPlaying(!audio.paused);
    setMuted(audio.muted);
    return () => {
      audio.removeEventListener('play',         onPlay);
      audio.removeEventListener('pause',        onPause);
      audio.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  if (!playing) return null;

  return (
    <button
      onClick={() => setMuted(toggleMute())}
      className="fixed bottom-4 right-4 z-50 text-xl opacity-40 hover:opacity-90 transition-opacity"
      aria-label="Toggle audio"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
};

function App() {
  const router = createBrowserRouter([
    // ── Pantallas SIN Layout (fullscreen limpias) ──
    { path: "/",          element: <Landing /> },
    { path: "/seleccion", element: <SoldierSelection /> },
    { path: "/mapa",      element: <CampaignMap /> },
    { path: "/comando",   element: <CommandPanel /> },

    // ── Pantallas CON Layout ──
    {
      element: <Layout />,
      children: [
        { path: "admin", element: <Home /> },
        { path: "vault", element: <CashCounter /> },
      ],
    },
  ]);

  return (
    <>
      <AudioToggle />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
