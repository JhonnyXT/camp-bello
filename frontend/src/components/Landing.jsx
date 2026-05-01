import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import campPoster from '../assets/camp-poster.png';
import { playAudio } from '../utils/audio';

// Partículas flotantes distribuidas uniformemente (evita Math.random para estabilidad)
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left:     (i * 3.4 + 1.5) % 98,
  delay:    (i * 0.55) % 10,
  duration: 9 + (i % 7),
  size:     0.8 + (i % 3) * 0.6,
}));

export const Landing = () => {
  const navigate  = useNavigate();
  const [phase,  setPhase]  = useState(0);

  // Secuencia de animación temporal
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // Cruz
      setTimeout(() => setPhase(2), 950),   // Título
      setTimeout(() => setPhase(3), 1700),  // Versículo
      setTimeout(() => setPhase(4), 2400),  // Botón
      setTimeout(() => setPhase(5), 3100),  // Nota de pie
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleStart = () => {
    playAudio();
    navigate('/seleccion');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-camp-carbon flex flex-col items-center justify-center select-none">

      {/* ── Fondo: poster del campamento ── */}
      <div className="absolute inset-0">
        <img
          src={campPoster}
          alt=""
          className="w-full h-full object-cover object-top opacity-50"
        />
        {/* Gradiente inferior para que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-camp-carbon via-camp-carbon/65 to-camp-carbon/10" />
        {/* Gradiente superior sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-camp-carbon/50 via-transparent to-transparent" />
        {/* Viñeta lateral */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(26,26,26,0.7)_100%)]" />
      </div>

      {/* ── Partículas flotantes (polvo/ceniza) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-camp-dorado animate-float-up"
            style={{
              left:              `${p.left}%`,
              bottom:            '-4px',
              width:             `${p.size}px`,
              height:            `${p.size}px`,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity:           0.5,
            }}
          />
        ))}
      </div>

      {/* ── Contenido principal ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl w-full">

        {/* Cruz — fase 1 */}
        <div
          className={`transition-all duration-1000 ease-out mb-4
            ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        >
          <span className="text-5xl sm:text-7xl animate-glow block leading-none">✝️</span>
        </div>

        {/* Título — fase 2 */}
        <div
          className={`transition-all duration-700 ease-out
            ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        >
          <p className="font-military text-camp-arena/70 tracking-[0.45em] text-xs sm:text-sm uppercase mb-3">
            ★ &nbsp;Bello · Antioquia&nbsp; ★
          </p>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-camp-hueso leading-none drop-shadow-lg whitespace-nowrap">
            PREPÁRATE PARA SER UN BUEN
          </h1>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-camp-dorado leading-none drop-shadow-lg whitespace-nowrap">
            SOLDADO DE CRISTO
          </h1>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="h-px w-12 sm:w-20 bg-camp-dorado/50" />
            <p className="font-display text-3xl sm:text-5xl text-camp-arena/85">2026</p>
            <div className="h-px w-12 sm:w-20 bg-camp-dorado/50" />
          </div>
        </div>

        {/* Versículo — fase 3 */}
        <div
          className={`transition-all duration-700 ease-out mt-5 sm:mt-7
            ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="font-military text-camp-arena/75 text-sm sm:text-xl italic leading-relaxed">
            &ldquo;Sufre penalidades como buen soldado de Jesucristo&rdquo;
          </p>
          <p className="font-military text-camp-dorado/75 text-xs sm:text-sm tracking-[0.35em] mt-1 uppercase">
            — 2 Timoteo 2:3
          </p>
        </div>

        {/* Botón COMENZAR — fase 4 */}
        <div
          className={`transition-all duration-700 ease-out mt-8 sm:mt-10
            ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <button
            onClick={handleStart}
            className="
              font-display tracking-[0.25em] text-lg sm:text-2xl
              px-10 sm:px-16 py-4 sm:py-5
              border-2 border-camp-dorado text-camp-dorado
              bg-transparent
              hover:bg-camp-dorado hover:text-camp-carbon
              active:scale-95
              transition-all duration-300
              rounded-sm
              animate-pulse-slow hover:animate-none
              uppercase
            "
          >
            ⚔️ &nbsp;COMENZAR MISIÓN
          </button>
        </div>

        {/* Nota de pie — fase 5 */}
        <div
          className={`transition-all duration-700 ease-out mt-6
            ${phase >= 5 ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="font-military text-camp-arena/25 text-xs tracking-[0.3em] uppercase">
            Campamento de Jóvenes &nbsp;·&nbsp; Bello Antioquia &nbsp;·&nbsp; 2026
          </p>
        </div>

      </div>
    </div>
  );
};
