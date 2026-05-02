import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MAP_ZONES } from '../constants/mapZones';
import { SOLDIERS_MAP } from '../constants/soldiers';
import { getZone, getProgressPct, formatPoints } from '../utils/game';

const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL) || 5000;

// Emojis para la animación de la ruleta en el mapa
const SPIN_EMOJIS = ['⚡', '💣', '🕊️', '🌪️', '🛡️', '🔥', '👑', '⛓️', '🎲', '💫', '⭐'];

// Overlay de ruleta girando (componente con su propio ciclo de animación)
const RuletaSpinOverlay = ({ data }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(prev => (prev + 1) % SPIN_EMOJIS.length), 150);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(circle at center, rgba(88,28,135,0.88) 0%, rgba(0,0,0,0.96) 70%)' }}>
      <div className="flex items-center gap-2 mb-8 animate-fade-in">
        <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse-slow" />
        <span className="font-military text-purple-400/80 text-xs tracking-[0.5em] uppercase">Ruleta girando</span>
        <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse-slow" />
      </div>
      <span style={{ fontSize: '9rem', lineHeight: 1 }}>{SPIN_EMOJIS[idx]}</span>
      <h1 className="font-display tracking-[0.25em] text-purple-400 mt-6"
        style={{ fontSize: 'clamp(2rem,6vw,4rem)', textShadow: '0 0 40px #a855f7' }}>RULETA</h1>
      {(data.teams || []).length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {data.teams.map(t => (
            <span key={t.id} className="font-military text-sm px-4 py-1.5 rounded-sm animate-zoom-in"
              style={{ backgroundColor: `${t.color}30`, border: `1px solid ${t.color}90`, color: t.color }}>
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Colores vivos para cada zona (borde izquierdo + fondo)
const ZONE_COLORS = {
  fortaleza: { border: '#C8922A', bg: 'rgba(200,146,42,0.12)',  text: '#C8922A' },
  batalla:   { border: '#A93226', bg: 'rgba(169,50,38,0.12)',   text: '#e87568' },
  monte:     { border: '#38bdf8', bg: 'rgba(14,165,233,0.10)',  text: '#7dd3fc' },
  desierto:  { border: '#D4C5A9', bg: 'rgba(212,197,169,0.10)', text: '#D4C5A9' },
  base:      { border: '#3D5A3E', bg: 'rgba(61,90,62,0.12)',    text: '#86efac' },
};

// ── Tarjeta de equipo en una zona ────────────────────────────────
const SoldierCard = ({ team, rank, flashType }) => {
  const soldier = SOLDIERS_MAP[team.soldierType];
  const medals  = ['🥇', '🥈', '🥉', '4️⃣'];

  return (
    <div
      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-sm min-w-[100px] animate-zoom-in
        ${flashType === 'emboscada' ? 'animate-shake' : ''}
        ${flashType === 'bono'      ? 'animate-glow'  : ''}
      `}
      style={{
        backgroundColor: `${team.color}18`,
        border: `1px solid ${team.color}70`,
        boxShadow: `0 0 12px ${team.color}25`,
      }}
    >
      <span className="text-xs">{medals[rank] ?? '🏅'}</span>
      <span
        className="text-3xl animate-march"
        style={{ animationDelay: `${rank * 0.2}s` }}
      >
        {soldier?.emoji ?? '🪖'}
      </span>
      <div
        className="w-4 h-4 rounded-full ring-2 ring-white/30"
        style={{ backgroundColor: team.color }}
      />
      <p
        className="font-military text-sm font-semibold tracking-wide text-center"
        style={{ color: team.color }}
      >
        {team.name}
      </p>
      <p className="font-display text-base text-camp-hueso">
        {formatPoints(team.cash)}
      </p>
      {soldier && (
        <p className="font-military text-[9px] text-camp-arena/50 tracking-widest uppercase">
          {soldier.name}
        </p>
      )}
    </div>
  );
};

// ── Banda de zona ────────────────────────────────────────────────
const ZoneBand = ({ zone, teams, flashTeamIds, flashType, globalRanks }) => {
  const colors   = ZONE_COLORS[zone.id] ?? ZONE_COLORS.base;
  const hasTeams = teams.length > 0;

  return (
    <div
      className="flex-1 flex items-center gap-5 px-5 border-b border-white/5 transition-all duration-700"
      style={{
        backgroundColor: hasTeams ? colors.bg : 'transparent',
        borderLeft: `4px solid ${hasTeams ? colors.border : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Info de zona */}
      <div className="flex items-center gap-3 w-52 shrink-0">
        <span className="text-3xl leading-none">{zone.emoji}</span>
        <div>
          <p
            className="font-display text-base tracking-widest leading-none"
            style={{ color: hasTeams ? colors.text : 'rgba(212,197,169,0.35)' }}
          >
            {zone.name}
          </p>
          <p className="font-military text-[10px] text-camp-arena/35 tracking-wider mt-0.5">
            {zone.rangeLabel}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="w-px self-stretch my-3" style={{ backgroundColor: `${colors.border}30` }} />

      {/* Soldados */}
      <div className="flex flex-wrap gap-3 flex-1 py-2">
        {hasTeams ? (
          teams.map((team) => (
            <SoldierCard
              key={team.id}
              team={team}
              rank={globalRanks.get(team.id) ?? 0}
              flashType={flashTeamIds?.includes(team.id) ? flashType : null}
            />
          ))
        ) : (
          <p className="font-military text-camp-arena/20 text-xs tracking-[0.3em] uppercase self-center">
            Zona vacía
          </p>
        )}
      </div>
    </div>
  );
};

// ── Panel de clasificación lateral ──────────────────────────────
const Leaderboard = ({ teams, maxCash }) => {
  const sorted = [...teams].sort((a, b) => Number(b.cash) - Number(a.cash));
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];

  return (
    <div className="w-60 shrink-0 flex flex-col border-l border-white/10">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <p className="font-display text-base text-camp-dorado tracking-widest">
          CLASIFICACIÓN
        </p>
      </div>

      <div className="flex flex-col gap-2 p-3 overflow-y-auto">
        {sorted.map((team, idx) => {
          const soldier = SOLDIERS_MAP[team.soldierType];
          const pct     = getProgressPct(team.cash, maxCash);

          return (
            <div
              key={team.id}
              className="rounded-sm overflow-hidden"
              style={{
                border: `1px solid ${team.color}50`,
                backgroundColor: `${team.color}12`,
              }}
            >
              <div className="relative flex items-center gap-2 p-2.5">
                <span className="text-base w-5 text-center">{medals[idx] ?? '—'}</span>
                <div
                  className="w-2 h-10 rounded-sm shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-military text-camp-hueso text-sm tracking-wide truncate">
                    {soldier?.emoji ?? '🪖'} {team.name}
                  </p>
                  <p
                    className="font-display text-sm leading-tight"
                    style={{ color: team.color }}
                  >
                    {formatPoints(team.cash)}
                  </p>
                  <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: team.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────
export const CampaignMap = () => {
  const navigate = useNavigate();
  const [teams,      setTeams]      = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pulse,      setPulse]      = useState(false);
  const [flashEvent,    setFlashEvent]    = useState(null);
  const [liveQuestion,  setLiveQuestion]  = useState(null);
  const [liveDecision,  setLiveDecision]  = useState(null);
  const [liveMission,   setLiveMission]   = useState(null);
  const [ruletaSpin,    setRuletaSpin]    = useState(null);

  // Cerrar overlay con ESC
  useEffect(() => {
    const onKey = ev => { if (ev.key === 'Escape') setFlashEvent(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const maxCash = teams.reduce((m, t) => Math.max(m, Number(t.cash)), 0);

  const fetchTeams = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
      setTeams(data);
      setDataLoaded(true);
      setLastUpdate(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    } catch {
      // silencioso en polling automático
    } finally {
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    const id = setInterval(() => fetchTeams(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchTeams]);

  // Escuchar eventos del Panel del Comandante (BroadcastChannel)
  useEffect(() => {
    const ch = new BroadcastChannel('camp-events');
    ch.onmessage = e => {
      const { type } = e.data;
      if (type === 'quiz-show')     { setLiveQuestion(e.data.question);  return; }
      if (type === 'quiz-hide')     { setLiveQuestion(null);              return; }
      if (type === 'decision-show') { setLiveDecision(e.data.decision);   return; }
      if (type === 'decision-hide') { setLiveDecision(null);              return; }
      if (type === 'mision-show')   { setLiveMission(e.data.mission);     return; }
      if (type === 'mision-hide')   { setLiveMission(null);               return; }
      if (type === 'ruleta-spin')   { setRuletaSpin(e.data);              return; }
      if (type === 'ruleta-hide')   { setRuletaSpin(null);                return; }
      if (type === 'quiz-result')   setLiveQuestion(null);
      if (type === 'decision')      setLiveDecision(null);
      if (type === 'mision')        setLiveMission(null);
      if (type === 'ruleta')        setRuletaSpin(null);
      setFlashEvent(e.data);
      fetchTeams();
    };
    return () => ch.close();
  }, [fetchTeams]);

  // Zonas de arriba (Fortaleza) a abajo (Base)
  const zoneGroups = [...MAP_ZONES].reverse().map(zone => ({
    zone,
    teams: [...teams]
      .filter(t => getZone(t.cash, maxCash).id === zone.id)
      .sort((a, b) => Number(b.cash) - Number(a.cash)),
  }));

  // Ranking global: Map<teamId, índice> ordenado por cash desc
  const globalRanks = new Map(
    [...teams]
      .sort((a, b) => Number(b.cash) - Number(a.cash))
      .map((t, i) => [t.id, i])
  );

  // Estado vacío: primera carga sin equipos
  if (dataLoaded && teams.length === 0) {
    return (
      <div className="h-screen bg-camp-carbon flex flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-6xl">🏕️</span>
        <h1 className="font-display text-4xl text-camp-hueso tracking-widest leading-none">
          SIN EQUIPOS
        </h1>
        <p className="font-military text-camp-arena/50 text-base tracking-wide max-w-xs">
          No hay equipos creados todavía. El Game Master debe crear los equipos y asignar soldados antes de comenzar.
        </p>
        <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
          <button
            onClick={() => navigate('/seleccion')}
            className="w-full font-display tracking-[0.15em] text-lg py-4 rounded-sm border-2 border-camp-dorado text-camp-dorado hover:bg-camp-dorado hover:text-camp-carbon transition-all uppercase"
          >
            ⚔️ Selección de Soldados
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="w-full font-military tracking-widest text-sm py-3 rounded-sm border border-camp-arena/25 text-camp-arena/45 hover:text-camp-arena/70 hover:border-camp-arena/45 transition-all uppercase"
          >
            ⚙️ Crear Equipos en Gestión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-camp-carbon flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
      >
        {/* Título */}
        <div className="flex items-center gap-4">
          <span className="text-xl">✝️</span>
          <div>
            <h1 className="font-display text-2xl text-camp-hueso tracking-[0.2em] leading-none">
              CAMPAÑA DEL SOLDADO
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-green-400 ${pulse ? 'animate-ping' : 'animate-pulse'}`} />
              <span className="font-military text-[10px] text-camp-arena/50 tracking-[0.3em] uppercase">
                En vivo — actualiza cada {POLL_MS / 1000}s
              </span>
              {lastUpdate && (
                <span className="font-military text-[10px] text-camp-arena/30">
                  · {lastUpdate.toLocaleTimeString('es-CO')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de navegación — claramente visibles */}
        <div className="flex items-center gap-2">
          {/* Actualizar */}
          <button
            onClick={() => fetchTeams(true)}
            disabled={refreshing}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-200 border"
            style={{
              borderColor: refreshing ? 'rgba(212,197,169,0.15)' : 'rgba(212,197,169,0.4)',
              color:       refreshing ? 'rgba(212,197,169,0.3)' : 'rgba(212,197,169,0.8)',
              background:  refreshing ? 'transparent' : 'rgba(212,197,169,0.06)',
            }}
          >
            {refreshing ? '⟳ ...' : '↻ Actualizar'}
          </button>

          {/* Ir a Selección */}
          <button
            onClick={() => navigate('/seleccion')}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-200"
            style={{
              border: '1px solid rgba(14,165,233,0.5)',
              color:  'rgba(14,165,233,0.9)',
              background: 'rgba(14,165,233,0.08)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}
          >
            🗺️ Selección
          </button>

          <button
            onClick={() => navigate('/comando')}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm transition-all duration-200"
            style={{
              border: '1px solid rgba(200,146,42,0.6)',
              color:  '#C8922A',
              background: 'rgba(200,146,42,0.10)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,146,42,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,146,42,0.10)'}
          >
            🎖️ Comandante
          </button>
        </div>
      </header>

      {/* ── Mapa + Leaderboard ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {zoneGroups.map(({ zone, teams: zoneTeams }) => (
            <ZoneBand
              key={zone.id}
              zone={zone}
              teams={zoneTeams}
              flashTeamIds={flashEvent?.teamIds}
              flashType={flashEvent?.type}
              globalRanks={globalRanks}
            />
          ))}
        </div>
        <Leaderboard teams={teams} maxCash={maxCash} />
      </div>

      {/* ── Footer ── */}
      <footer
        className="px-5 py-2 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="font-military text-[10px] text-camp-arena/20 tracking-[0.3em] text-center uppercase">
          &ldquo;Sufre penalidades como buen soldado de Jesucristo&rdquo; — 2 Timoteo 2:3
        </p>
      </footer>

      {/* ── Overlay de pregunta en vivo (quiz-show) ── */}
      {liveQuestion && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
          style={{ background: 'radial-gradient(circle at center, rgba(23,37,84,0.92) 0%, rgba(0,0,0,0.96) 70%)' }}
        >
          {/* Badge EN VIVO */}
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse-slow" />
            <span className="font-military text-blue-400/80 text-xs tracking-[0.5em] uppercase">Quiz en vivo</span>
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse-slow" />
          </div>

          {/* Pregunta */}
          <h2
            className="font-display text-camp-hueso text-center mb-8 animate-zoom-in leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', maxWidth: '820px', textShadow: '0 0 30px rgba(96,165,250,0.4)' }}
          >
            {liveQuestion.text}
          </h2>

          {/* Opciones múltiple */}
          {liveQuestion.type === 'multiple' && liveQuestion.options && (
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl animate-fade-in">
              {['A', 'B', 'C', 'D'].map(opt =>
                liveQuestion.options[opt] ? (
                  <div key={opt}
                    className="flex items-center gap-4 px-5 py-4 rounded-sm border border-blue-400/35"
                    style={{ background: 'rgba(59,130,246,0.07)' }}
                  >
                    <span
                      className="font-display text-2xl shrink-0 w-10 h-10 rounded-full border-2 border-blue-400/60 flex items-center justify-center"
                      style={{ color: '#60a5fa' }}
                    >{opt}</span>
                    <span className="font-military text-base text-camp-arena/90 leading-snug">
                      {liveQuestion.options[opt]}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Verdadero / Falso */}
          {liveQuestion.type === 'truefalse' && (
            <div className="flex gap-6 animate-fade-in">
              <div className="px-12 py-6 rounded-sm border-2 border-green-400/50"
                style={{ background: 'rgba(16,185,129,0.08)' }}>
                <span className="font-display text-4xl text-green-400 tracking-widest">✓ VERDADERO</span>
              </div>
              <div className="px-12 py-6 rounded-sm border-2 border-red-400/50"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <span className="font-display text-4xl text-red-400 tracking-widest">✗ FALSO</span>
              </div>
            </div>
          )}

          <p className="font-military text-camp-arena/20 text-xs tracking-widest mt-10 uppercase animate-fade-in">
            El comandante marcará los resultados
          </p>
        </div>
      )}

      {/* ── Overlay de decisión en vivo (decision-show) ── */}
      {liveDecision && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
          style={{ background: 'radial-gradient(circle at center, rgba(78,52,0,0.92) 0%, rgba(0,0,0,0.96) 70%)' }}>
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse-slow" />
            <span className="font-military text-amber-400/80 text-xs tracking-[0.5em] uppercase">Decisión en vivo</span>
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse-slow" />
          </div>
          <h2 className="font-display text-camp-hueso text-center mb-10 animate-zoom-in leading-tight"
            style={{ fontSize: 'clamp(1.8rem,5vw,3.5rem)', maxWidth: '820px', textShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
            {liveDecision.dilemma}
          </h2>
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in">
            {[['A', liveDecision.optionA, '#60a5fa'], ['B', liveDecision.optionB, '#f59e0b']].map(([label, opt, color]) => (
              <div key={label} className="flex flex-col items-center gap-3 px-6 py-5 rounded-sm border"
                style={{ borderColor: `${color}50`, background: `${color}0a` }}>
                <span className="font-display text-5xl" style={{ color }}>{label}</span>
                {opt?.text && <p className="font-military text-base text-camp-arena/80 text-center">{opt.text}</p>}
                <p className="font-display text-xl" style={{ color }}>{opt?.delta > 0 ? '+' : ''}{opt?.delta} pts</p>
              </div>
            ))}
          </div>
          <p className="font-military text-camp-arena/20 text-xs tracking-widest mt-10 uppercase animate-fade-in">
            El comandante asignará las opciones por equipo
          </p>
        </div>
      )}

      {/* ── Overlay de misión en vivo (mision-show) ── */}
      {liveMission && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
          style={{ background: 'radial-gradient(circle at center, rgba(6,46,26,0.92) 0%, rgba(0,0,0,0.96) 70%)' }}>
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="font-military text-emerald-400/80 text-xs tracking-[0.5em] uppercase">Misión en vivo</span>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse-slow" />
          </div>
          <span className="text-8xl mb-4 animate-zoom-in">🎯</span>
          <h2 className="font-display text-camp-hueso text-center mb-4 animate-zoom-in tracking-widest"
            style={{ fontSize: 'clamp(2rem,6vw,4rem)', textShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
            {liveMission.title}
          </h2>
          {liveMission.description && (
            <p className="font-military text-camp-arena/70 text-xl text-center max-w-2xl animate-fade-in leading-relaxed">
              {liveMission.description}
            </p>
          )}
          <p className="font-military text-camp-arena/20 text-xs tracking-widest mt-10 uppercase animate-fade-in">
            El comandante asignará los equipos y marcará el resultado
          </p>
        </div>
      )}

      {/* ── Overlay de ruleta girando (ruleta-spin) ── */}
      {ruletaSpin && <RuletaSpinOverlay data={ruletaSpin} />}

      {/* ── Overlay de evento en tiempo real ── */}
      {flashEvent && (() => {
        const e = flashEvent;

        const BG = {
          emboscada: 'radial-gradient(circle at center, rgba(169,50,38,0.55) 0%, rgba(0,0,0,0.8) 70%)',
          bono:      'radial-gradient(circle at center, rgba(200,146,42,0.55) 0%, rgba(0,0,0,0.8) 70%)',
          quiz:      'radial-gradient(circle at center, rgba(59,130,246,0.50) 0%, rgba(0,0,0,0.8) 70%)',
          decision:  'radial-gradient(circle at center, rgba(245,158,11,0.50) 0%, rgba(0,0,0,0.8) 70%)',
          mision:    (e.passTeams?.length > 0)
            ? 'radial-gradient(circle at center, rgba(16,185,129,0.50) 0%, rgba(0,0,0,0.8) 70%)'
            : 'radial-gradient(circle at center, rgba(169,50,38,0.50) 0%, rgba(0,0,0,0.8) 70%)',
          ruleta:    e.positive
            ? 'radial-gradient(circle at center, rgba(168,85,247,0.50) 0%, rgba(0,0,0,0.8) 70%)'
            : 'radial-gradient(circle at center, rgba(168,85,247,0.40) 0%, rgba(0,0,0,0.8) 70%)',
        }[e.type] || 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 70%)';

        const TeamBadge = ({ t }) => (
          <span
            className="font-military text-sm px-4 py-1.5 rounded-sm animate-zoom-in"
            style={{ backgroundColor: `${t.color}30`, border: `1px solid ${t.color}90`, color: t.color }}
          >{t.name}</span>
        );

        return (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 animate-fade-in"
            style={{ background: BG }}
            onClick={() => setFlashEvent(null)}
          >
            {/* Botón cerrar */}
            <button
              onClick={e => { e.stopPropagation(); setFlashEvent(null); }}
              className="absolute top-6 right-6 font-military text-camp-arena/40 hover:text-camp-hueso text-sm tracking-widest border border-camp-arena/20 hover:border-camp-arena/50 px-4 py-1.5 rounded-sm transition-all"
            >ESC · CERRAR</button>
            {/* ── EMBOSCADA ── */}
            {e.type === 'emboscada' && <>
              <span className="text-9xl mb-4 animate-zoom-in">💥</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-camp-rojo"
                style={{ fontSize: 'clamp(3rem,8vw,6rem)', textShadow: '0 0 40px #A93226, 0 0 80px #A9322640' }}>
                EMBOSCADA
              </h1>
              <p className="font-military text-camp-arena/70 text-2xl tracking-widest mt-3 animate-fade-in">−{e.amount} puntos</p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {(e.teams || []).map(t => <TeamBadge key={t.id} t={t} />)}
              </div>
              {(e.passiveAdjustments || []).length > 0 && (
                <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
                  {e.passiveAdjustments.map(pa => (
                    <p key={pa.teamId} className="font-military text-green-400 text-lg tracking-wide">
                      🛡️ {pa.teamName} ({pa.soldierEmoji} {pa.soldierName}) absorbió {Math.abs(pa.diff)} pts
                    </p>
                  ))}
                </div>
              )}
            </>}

            {/* ── BONO ── */}
            {e.type === 'bono' && <>
              <span className="text-9xl mb-4 animate-zoom-in">🌟</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-camp-dorado"
                style={{ fontSize: 'clamp(3rem,8vw,6rem)', textShadow: '0 0 40px #C8922A, 0 0 80px #C8922A40' }}>
                BONO DE HONOR
              </h1>
              <p className="font-military text-camp-arena/70 text-2xl tracking-widest mt-3 animate-fade-in">+{e.amount} puntos</p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {(e.teams || []).map(t => <TeamBadge key={t.id} t={t} />)}
              </div>
              {(e.passiveAdjustments || []).length > 0 && (
                <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
                  {e.passiveAdjustments.map(pa => (
                    <p key={pa.teamId} className="font-military text-camp-dorado text-lg tracking-wide">
                      ⚔️ {pa.teamName} ({pa.soldierEmoji} {pa.soldierName}) +{pa.diff} pts extra
                    </p>
                  ))}
                </div>
              )}
            </>}

            {/* ── QUIZ RESULT ── */}
            {e.type === 'quiz-result' && <>
              <span className="text-8xl mb-3 animate-zoom-in">🧠</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-blue-400"
                style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', textShadow: '0 0 40px #3b82f6' }}>
                QUIZ
              </h1>
              {e.question?.text && (
                <p className="font-military text-camp-arena/80 text-xl text-center mt-3 max-w-2xl animate-fade-in leading-relaxed">
                  {e.question.text}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-8 mt-6">
                {(e.winnerTeams || []).length > 0 && (
                  <div className="text-center">
                    <p className="font-military text-green-400/70 text-xs tracking-widest mb-2">✓ CORRECTO +{(e.winnerTeams[0] || {}).amount}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {e.winnerTeams.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
                {(e.loserTeams || []).length > 0 && (
                  <div className="text-center">
                    <p className="font-military text-red-400/70 text-xs tracking-widest mb-2">✗ INCORRECTO −{(e.loserTeams[0] || {}).amount}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {e.loserTeams.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
              </div>
            </>}

            {/* ── DECISIÓN ── */}
            {e.type === 'decision' && <>
              <span className="text-8xl mb-3 animate-zoom-in">⚔️</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-amber-400"
                style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', textShadow: '0 0 40px #f59e0b' }}>
                DECISIÓN
              </h1>
              {e.dilemma && (
                <p className="font-military text-camp-arena/80 text-xl text-center mt-3 max-w-2xl animate-fade-in leading-relaxed">
                  {e.dilemma}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-8 mt-6">
                {(e.teamsA || []).length > 0 && (
                  <div className="text-center">
                    <p className="font-military text-blue-400/70 text-xs tracking-widest mb-2">
                      OPCIÓN A: {e.optionA?.text} ({e.optionA?.delta > 0 ? '+' : ''}{e.optionA?.delta} pts)
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {e.teamsA.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
                {(e.teamsB || []).length > 0 && (
                  <div className="text-center">
                    <p className="font-military text-amber-400/70 text-xs tracking-widest mb-2">
                      OPCIÓN B: {e.optionB?.text} ({e.optionB?.delta > 0 ? '+' : ''}{e.optionB?.delta} pts)
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {e.teamsB.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
              </div>
            </>}

            {/* ── MISIÓN ── */}
            {e.type === 'mision' && <>
              <span className="text-8xl mb-3 animate-zoom-in">🎯</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-emerald-400"
                style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', textShadow: '0 0 40px #10b981' }}>
                MISIÓN
              </h1>
              {e.title && (
                <p className="font-military text-camp-arena/80 text-2xl text-center mt-3 animate-fade-in tracking-wider">
                  {e.title}
                </p>
              )}
              {e.description && (
                <p className="font-military text-camp-arena/50 text-base text-center mt-2 max-w-xl animate-fade-in">
                  {e.description}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-6 mt-5">
                {(e.passTeams || []).length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-military text-green-400 text-sm tracking-widest uppercase">✅ Superaron +{e.amount}</p>
                    <div className="flex flex-wrap gap-2">
                      {e.passTeams.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
                {(e.failTeams || []).length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-military text-red-400 text-sm tracking-widest uppercase">❌ Fallaron −{e.amount}</p>
                    <div className="flex flex-wrap gap-2">
                      {e.failTeams.map(t => <TeamBadge key={t.id} t={t} />)}
                    </div>
                  </div>
                )}
              </div>
            </>}

            {/* ── RULETA ── */}
            {e.type === 'ruleta' && <>
              <span className="text-9xl mb-3 animate-zoom-in">{e.event?.emoji ?? '🎲'}</span>
              <h1 className="font-display tracking-[0.25em] animate-zoom-in text-purple-400"
                style={{ fontSize: 'clamp(2rem,6vw,4.5rem)', textShadow: '0 0 40px #a855f7' }}>
                RULETA
              </h1>
              <p className="font-military text-camp-arena/80 text-2xl text-center mt-3 animate-fade-in tracking-wider">
                {e.event?.name}
              </p>
              <p className="font-military text-xl tracking-widest mt-2 animate-fade-in"
                style={{ color: e.positive ? '#34d399' : '#f87171' }}>
                {e.positive ? '+' : '−'}{e.amount} puntos
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {(e.teams || []).map(t => <TeamBadge key={t.id} t={t} />)}
              </div>
            </>}
          </div>
        );
      })()}
    </div>
  );
};
