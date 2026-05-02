import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';
import { SOLDIERS_MAP } from '../constants/soldiers';
import { applyPassive, formatPoints } from '../utils/game';
import { getQuestions, saveQuestion, deleteQuestion, getDecisions, saveDecision, deleteDecision, getMissions, saveMission, deleteMission } from '../utils/questionBank';

const MASTER_PIN = import.meta.env.VITE_MASTER_PIN || '1234';

const RULETA_EVENTS = [
  { emoji: '⚡', name: '¡Avance Relámpago!',      delta:  300, positive: true  },
  { emoji: '💣', name: '¡Trampa del Enemigo!',    delta: -200, positive: false },
  { emoji: '🕊️', name: '¡Gracia del Cielo!',      delta:  500, positive: true  },
  { emoji: '🌪️', name: '¡Tormenta del Desierto!', delta: -150, positive: false },
  { emoji: '🛡️', name: '¡Escudo de Fe!',           delta:  250, positive: true  },
  { emoji: '🔥', name: '¡El Refinador!',           delta: -100, positive: false },
  { emoji: '👑', name: '¡Corona de Gloria!',       delta:  400, positive: true  },
  { emoji: '⛓️', name: '¡Cadenas Rotas!',          delta:  150, positive: true  },
];

// ── Pantalla de PIN ──────────────────────────────────────────────
const PinScreen = ({ onAuth }) => {
  const [pin,   setPin]   = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (pin === MASTER_PIN) {
      onAuth();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-camp-carbon flex flex-col items-center justify-center gap-8 px-6">
      <span className="text-6xl animate-glow">🎖️</span>

      <div className="text-center">
        <p className="font-military text-camp-arena/40 tracking-[0.45em] text-xs uppercase mb-2">
          ★ &nbsp;Acceso restringido&nbsp; ★
        </p>
        <h1 className="font-display text-5xl sm:text-7xl text-camp-hueso tracking-widest leading-none">
          PANEL DEL
        </h1>
        <h1 className="font-display text-5xl sm:text-7xl text-camp-dorado tracking-widest leading-none">
          COMANDANTE
        </h1>
        <p className="font-military text-camp-arena/40 text-sm mt-3 tracking-widest">
          Solo los líderes autorizados pueden acceder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="● ● ● ●"
          autoFocus
          className={`
            w-full text-center font-display text-3xl tracking-[0.6em]
            bg-transparent border-2 rounded-sm py-4 px-6
            text-camp-hueso placeholder:text-camp-arena/20
            focus:outline-none transition-all duration-300
            ${error
              ? 'border-camp-rojo animate-shake'
              : 'border-camp-dorado/40 focus:border-camp-dorado'}
          `}
        />
        {error && (
          <p className="font-military text-camp-rojo text-sm tracking-widest uppercase animate-fade-in">
            PIN incorrecto — intenta de nuevo
          </p>
        )}
        <button
          type="submit"
          className="w-full font-display tracking-widest text-xl py-4 border-2 border-camp-dorado text-camp-dorado hover:bg-camp-dorado hover:text-camp-carbon transition-all duration-300 rounded-sm uppercase"
        >
          Entrar al Cuartel →
        </button>
      </form>
    </div>
  );
};

// ── Tarjeta de control de un equipo ─────────────────────────────
const TeamControl = ({ team, onUpdate }) => {
  const soldier         = SOLDIERS_MAP[team.soldierType];
  const [custom,  setCustom]  = useState('');
  const [loading, setLoading] = useState(null);

  const applyDelta = async (rawDelta, eventType = 'bono') => {
    const delta   = Math.round(applyPassive(team, eventType, rawDelta));
    const newCash = Math.max(0, Number(team.cash) + delta);
    setLoading(rawDelta);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/teams/${team.id}`,
        { cash: newCash }
      );
      onUpdate(team.id, newCash);
    } finally {
      setLoading(null);
    }
  };

  const handleCustom = () => {
    const val = parseInt(custom, 10);
    if (!isNaN(val) && val !== 0) {
      applyDelta(val);
      setCustom('');
    }
  };

  return (
    <div
      className="rounded-sm p-4 flex flex-col gap-3 border"
      style={{ borderColor: `${team.color}55`, backgroundColor: `${team.color}0d` }}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full ring-2 ring-white/20 shrink-0"
          style={{ backgroundColor: team.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-military text-camp-hueso text-base tracking-wide leading-none">
            {team.name}
          </p>
          <p className="font-military text-camp-arena/40 text-xs mt-0.5">
            {soldier?.emoji ?? '🪖'} {soldier?.name ?? 'Sin arquetipo'}
          </p>
        </div>
        <p
          className="font-display text-xl shrink-0 leading-none"
          style={{ color: team.color }}
        >
          {formatPoints(team.cash)}
        </p>
      </div>

      {/* Botones rápidos de puntos */}
      <div className="grid grid-cols-4 gap-1.5">
        {[-200, -100, +100, +200].map(delta => (
          <button
            key={delta}
            onClick={() => applyDelta(delta)}
            disabled={loading !== null}
            className="font-military text-sm py-2 rounded-sm border transition-all duration-150 disabled:opacity-40"
            style={{
              borderColor:     delta < 0 ? 'rgba(169,50,38,0.6)' : 'rgba(61,90,62,0.7)',
              color:           delta < 0 ? '#f87171'             : '#86efac',
              backgroundColor: loading === delta
                ? (delta < 0 ? 'rgba(169,50,38,0.2)' : 'rgba(61,90,62,0.2)')
                : 'transparent',
            }}
          >
            {loading === delta ? '…' : `${delta > 0 ? '+' : ''}${delta}`}
          </button>
        ))}
      </div>

      {/* Monto personalizado */}
      <div className="flex gap-2">
        <input
          type="number"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustom()}
          placeholder="± monto libre"
          className="flex-1 bg-transparent border border-camp-arena/20 rounded-sm px-3 py-2 font-military text-sm text-camp-hueso placeholder:text-camp-arena/25 focus:outline-none focus:border-camp-arena/50 transition-colors"
        />
        <button
          onClick={handleCustom}
          disabled={!custom || loading !== null}
          className="font-military text-sm px-4 py-2 rounded-sm border border-camp-dorado/50 text-camp-dorado hover:bg-camp-dorado/15 disabled:opacity-30 transition-all"
        >
          ✓
        </button>
      </div>
    </div>
  );
};

// ── Modal de selección de alcance ───────────────────────────────
const SCOPE_META = {
  emboscada: { emoji: '💥', label: 'EMBOSCADA',    color: '#f87171',  border: 'rgba(169,50,38,0.5)' },
  bono:      { emoji: '🌟', label: 'BONO DE HONOR', color: '#C8922A', border: 'rgba(200,146,42,0.5)' },
  ruleta:    { emoji: '🎲', label: 'RULETA',        color: '#c084fc',  border: 'rgba(168,85,247,0.5)' },
};

const ScopePickerModal = ({ activity, teams, onClose, onSelect }) => {
  const meta = SCOPE_META[activity] || {};
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-xs border animate-fade-in"
        style={{ borderColor: meta.border, boxShadow: `0 0 40px ${meta.border}` }}
      >
        {/* Cabecera */}
        <div className="text-center mb-5">
          <span className="text-5xl block mb-2">{meta.emoji}</span>
          <h3 className="font-display text-2xl tracking-widest" style={{ color: meta.color }}>
            {meta.label}
          </h3>
          <p className="font-military text-camp-arena/45 text-sm mt-1">
            ¿A quién aplica esta actividad?
          </p>
        </div>

        {/* Todos */}
        <button
          onClick={() => onSelect('all')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border border-camp-arena/25 hover:border-camp-arena/55 hover:bg-white/5 transition-all mb-3 group"
        >
          <span className="text-xl">👥</span>
          <div className="text-left flex-1">
            <p className="font-military text-camp-hueso text-sm tracking-wide">Todos los equipos</p>
            <p className="font-military text-camp-arena/35 text-xs">{teams.length} equipos participan</p>
          </div>
          <span className="font-military text-xs text-camp-arena/30 group-hover:text-camp-dorado transition-colors">→</span>
        </button>

        <p className="font-military text-camp-arena/25 text-[10px] tracking-widest uppercase text-center mb-3">
          o elige un equipo
        </p>

        {/* Lista de equipos */}
        <div className="space-y-1.5 mb-4">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => onSelect(team.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border border-camp-arena/15 hover:border-camp-arena/40 hover:bg-white/5 transition-all group"
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
              <span className="font-military text-sm text-camp-hueso flex-1 text-left">{team.name}</span>
              <span className="font-military text-xs text-camp-arena/25 group-hover:text-camp-dorado transition-colors">→</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full font-military text-camp-arena/30 hover:text-camp-arena/60 py-2 text-sm transition-colors uppercase tracking-widest"
        >
          Cancelar (Esc)
        </button>
      </div>
    </div>
  );
};

// ── Modal de evento rápido ───────────────────────────────────────
const QuickEventModal = ({ type, teams, onClose, onApply, preSelectedTeams = null }) => {
  const isBono = type === 'bono';
  const [selected, setSelected] = useState(() => {
    if (preSelectedTeams === 'all') return teams.map(t => t.id);
    if (Array.isArray(preSelectedTeams)) return preSelectedTeams;
    return [];
  });
  const [amount,   setAmount]   = useState('');

  const toggle = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const selectAll = () => setSelected(teams.map(t => t.id));

  const handleApply = () => {
    const val = parseInt(amount, 10);
    if (!val || selected.length === 0) return;
    onApply(selected, isBono ? Math.abs(val) : -Math.abs(val));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-sm border"
        style={{
          borderColor: isBono ? '#C8922A80' : '#A9322680',
          boxShadow:   `0 0 40px ${isBono ? 'rgba(200,146,42,0.15)' : 'rgba(169,50,38,0.15)'}`,
        }}
      >
        <div className="text-center mb-5">
          <span className="text-5xl block mb-2">{isBono ? '🌟' : '💥'}</span>
          <h3
            className="font-display text-2xl tracking-widest"
            style={{ color: isBono ? '#C8922A' : '#f87171' }}
          >
            {isBono ? 'BONO DE HONOR' : 'EMBOSCADA'}
          </h3>
          <p className="font-military text-camp-arena/45 text-sm mt-1">
            {isBono
              ? 'Suma puntos a los equipos seleccionados'
              : 'Resta puntos a los equipos seleccionados'}
          </p>
        </div>

        {/* Selección de equipos */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => toggle(team.id)}
              className="flex items-center gap-2 p-2.5 rounded-sm border transition-all"
              style={{
                borderColor:     selected.includes(team.id) ? team.color : 'rgba(255,255,255,0.12)',
                backgroundColor: selected.includes(team.id) ? `${team.color}28` : 'transparent',
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
              <span className="font-military text-sm text-camp-hueso">{team.name}</span>
              {selected.includes(team.id) && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={selectAll}
          className="w-full font-military text-xs text-camp-arena/40 hover:text-camp-arena/70 tracking-widest uppercase mb-4 transition-colors"
        >
          Seleccionar todos
        </button>

        {/* Monto */}
        <input
          type="number"
          min="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Cantidad de puntos"
          autoFocus
          className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-3 font-display text-lg text-camp-hueso placeholder:text-camp-arena/25 focus:outline-none focus:border-camp-arena/50 mb-4 text-center"
        />

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={!amount || selected.length === 0}
            className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 transition-all disabled:opacity-30 uppercase"
            style={{
              borderColor: isBono ? '#C8922A' : '#A93226',
              color:       isBono ? '#C8922A' : '#f87171',
            }}
          >
            {isBono ? '+ Aplicar Bono' : '− Aplicar Emboscada'}
          </button>
          <button
            onClick={onClose}
            className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4 transition-colors uppercase tracking-widest text-sm"
          >
            Esc
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Quiz (banco de preguntas) ──────────────────────────────
const QuizModal = ({ teams, onClose, onApply }) => {
  const [view,       setView]       = useState('bank'); // 'bank' | 'create' | 'active'
  const [questions,  setQuestions]  = useState(() => getQuestions());
  const [editing,    setEditing]    = useState(null);
  const [activeQ,    setActiveQ]    = useState(null);
  const [teamStatus,     setTeamStatus]     = useState({});
  const [retryAvailable, setRetryAvailable] = useState({});

  // Campos del formulario
  const [fText,    setFText]    = useState('');
  const [fType,    setFType]    = useState('multiple');
  const [fOpts,    setFOpts]    = useState({ A: '', B: '', C: '', D: '' });
  const [fCorrect, setFCorrect] = useState('A');
  const [fWinPts,  setFWinPts]  = useState('200');
  const [fLosePts, setFLosePts] = useState('100');

  const refresh = () => setQuestions(getQuestions());

  const openCreate = (q = null) => {
    setEditing(q);
    setFText(q?.text ?? '');
    setFType(q?.type ?? 'multiple');
    setFOpts(q?.options ?? { A: '', B: '', C: '', D: '' });
    setFCorrect(q?.correct ?? 'A');
    setFWinPts(String(q?.winPts ?? 200));
    setFLosePts(String(q?.losePts ?? 100));
    setView('create');
  };

  const handleSave = () => {
    if (!fText.trim()) return;
    saveQuestion({
      id:      editing?.id ?? Date.now(),
      text:    fText.trim(),
      type:    fType,
      options: fType === 'multiple' ? fOpts : null,
      correct: fCorrect,
      winPts:  parseInt(fWinPts,  10) || 200,
      losePts: parseInt(fLosePts, 10) || 100,
    });
    refresh();
    setView('bank');
  };

  const handleDelete = id => { deleteQuestion(id); refresh(); };

  const handleLaunch = q => {
    setActiveQ(q);
    setTeamStatus({});
    setRetryAvailable({});
    onApply({ type: 'quiz-show', question: q, _silent: true }, []);
    setView('active');
  };

  const setStatus = (id, s) =>
    setTeamStatus(prev => ({ ...prev, [id]: prev[id] === s ? null : s }));

  const handleApplyResult = () => {
    if (!activeQ) return;
    const winnersFull = teams.filter(t => teamStatus[t.id] === 'win' && !retryAvailable[t.id]);
    const winnersHalf = teams.filter(t => teamStatus[t.id] === 'win' &&  retryAvailable[t.id]);
    const losers      = teams.filter(t => teamStatus[t.id] === 'lose');
    const passiveAdjustments = [];

    const updates = [
      ...winnersFull.map(t => ({ teamId: t.id, newCash: Math.max(0, +t.cash + activeQ.winPts) })),
      ...winnersHalf.map(t => ({ teamId: t.id, newCash: Math.max(0, +t.cash + Math.round(activeQ.winPts / 2)) })),
      ...losers.map(t => {
        const penalty  = Math.round(applyPassive(t, 'penalizacion', -activeQ.losePts));
        if (penalty !== -activeQ.losePts) {
          const s = SOLDIERS_MAP[t.soldierType];
          passiveAdjustments.push({ teamId: t.id, teamName: t.name, raw: activeQ.losePts, adjusted: Math.abs(penalty), diff: activeQ.losePts - Math.abs(penalty), soldierName: s?.name ?? '', soldierEmoji: s?.emoji ?? '' });
        }
        return { teamId: t.id, newCash: Math.max(0, +t.cash + penalty) };
      }),
    ];

    onApply({
      type:        'quiz-result',
      question:    activeQ,
      winnerTeams: [
        ...winnersFull.map(t => ({ ...t, amount: activeQ.winPts })),
        ...winnersHalf.map(t => ({ ...t, amount: Math.round(activeQ.winPts / 2), retried: true })),
      ],
      loserTeams:  losers.map(t => ({ ...t, amount: Math.abs(Math.round(applyPassive(t, 'penalizacion', -activeQ.losePts))) })),
      passiveAdjustments,
    }, updates);
    onClose();
  };

  const correctLabel = q =>
    q.correct === 'true'  ? 'Verdadero' :
    q.correct === 'false' ? 'Falso'     : `Opción ${q.correct}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-md border border-blue-500/40 overflow-y-auto max-h-[92vh]"
        style={{ boxShadow: '0 0 40px rgba(59,130,246,0.15)' }}
      >

        {/* ── BANK VIEW ── */}
        {view === 'bank' && (
          <>
            <div className="text-center mb-5">
              <span className="text-5xl block mb-2">🧠</span>
              <h3 className="font-display text-2xl tracking-widest text-blue-400">BANCO DE QUIZ</h3>
              <p className="font-military text-camp-arena/40 text-sm mt-1">
                {questions.length} pregunta(s) guardada(s)
              </p>
            </div>

            {questions.length === 0 ? (
              <p className="font-military text-camp-arena/30 text-sm tracking-widest text-center py-8">
                Sin preguntas — crea la primera
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                {questions.map(q => (
                  <div key={q.id}
                    className="flex items-start gap-2 p-3 rounded-sm border border-camp-arena/15 hover:border-camp-arena/30 transition-colors"
                  >
                    <span className="text-base shrink-0 mt-0.5">{q.type === 'multiple' ? '🔤' : '⚖️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-military text-sm text-camp-hueso leading-snug line-clamp-2">{q.text}</p>
                      <p className="font-military text-xs text-camp-arena/35 mt-0.5">
                        ✓ {correctLabel(q)} · +{q.winPts} / −{q.losePts} pts
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      <button onClick={() => openCreate(q)}
                        className="text-xs px-2 py-1 border border-camp-arena/20 text-camp-arena/40 hover:text-camp-arena/70 rounded-sm transition-colors"
                      >✎</button>
                      <button onClick={() => handleDelete(q.id)}
                        className="text-xs px-2 py-1 border border-red-500/20 text-red-400/40 hover:text-red-400 rounded-sm transition-colors"
                      >✕</button>
                      <button onClick={() => handleLaunch(q)}
                        className="text-xs px-3 py-1 border border-blue-400/60 text-blue-400 hover:bg-blue-400/15 rounded-sm font-display tracking-widest transition-all"
                      >▶</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button onClick={() => openCreate()}
                className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-blue-400 text-blue-400 hover:bg-blue-400/15 uppercase transition-all"
              >+ Nueva Pregunta</button>
              <button onClick={onClose} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">Esc</button>
            </div>
          </>
        )}

        {/* ── CREATE / EDIT VIEW ── */}
        {view === 'create' && (
          <>
            <div className="text-center mb-5">
              <h3 className="font-display text-2xl tracking-widest text-blue-400">
                {editing ? 'EDITAR PREGUNTA' : 'NUEVA PREGUNTA'}
              </h3>
            </div>

            <textarea
              value={fText} onChange={e => setFText(e.target.value)}
              placeholder="Escribe la pregunta aquí…" rows={3} autoFocus
              className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-3 font-military text-sm text-camp-hueso placeholder:text-camp-arena/30 focus:outline-none focus:border-blue-400/50 resize-none mb-4"
            />

            {/* Tipo */}
            <div className="flex gap-2 mb-4">
              {[['multiple', '🔤 Múltiple (A-D)'], ['truefalse', '⚖️ Verdadero / Falso']].map(([t, label]) => (
                <button key={t}
                  onClick={() => { setFType(t); setFCorrect(t === 'truefalse' ? 'true' : 'A'); }}
                  className={`flex-1 font-military text-xs py-2 rounded-sm border transition-all ${
                    fType === t
                      ? 'border-blue-400/70 bg-blue-400/15 text-blue-300'
                      : 'border-camp-arena/20 text-camp-arena/40 hover:border-camp-arena/50'}`}
                >{label}</button>
              ))}
            </div>

            {/* Opciones múltiple */}
            {fType === 'multiple' && (
              <div className="space-y-2 mb-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className="flex gap-2 items-center">
                    <button
                      onClick={() => setFCorrect(opt)}
                      className={`w-8 h-8 rounded-full border-2 font-display text-sm flex items-center justify-center shrink-0 transition-all ${
                        fCorrect === opt
                          ? 'border-green-400 bg-green-400/20 text-green-400'
                          : 'border-camp-arena/30 text-camp-arena/50 hover:border-camp-arena/60'}`}
                    >{opt}</button>
                    <input
                      value={fOpts[opt]}
                      onChange={e => setFOpts(p => ({ ...p, [opt]: e.target.value }))}
                      placeholder={`Opción ${opt}`}
                      className={`flex-1 bg-transparent border rounded-sm px-3 py-2 font-military text-sm text-camp-hueso placeholder:text-camp-arena/25 focus:outline-none transition-colors ${
                        fCorrect === opt
                          ? 'border-green-400/50 bg-green-500/05'
                          : 'border-camp-arena/20 focus:border-camp-arena/50'}`}
                    />
                    {fCorrect === opt && (
                      <span className="font-military text-green-400 text-xs shrink-0">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Verdadero / Falso */}
            {fType === 'truefalse' && (
              <div className="flex gap-3 mb-4">
                {[['true', '✓ VERDADERO', '#34d399'], ['false', '✗ FALSO', '#f87171']].map(([v, label, color]) => (
                  <button key={v} onClick={() => setFCorrect(v)}
                    className="flex-1 py-3 rounded-sm border-2 font-display tracking-widest text-sm transition-all"
                    style={{
                      borderColor:     fCorrect === v ? color : 'rgba(212,197,169,0.25)',
                      backgroundColor: fCorrect === v ? `${color}20` : 'transparent',
                      color:           fCorrect === v ? color : 'rgba(212,197,169,0.4)',
                    }}
                  >{label}</button>
                ))}
              </div>
            )}

            {/* Puntos */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <p className="font-military text-xs text-green-400/70 tracking-widest mb-1">✓ Puntos si acierta</p>
                <input type="number" value={fWinPts} onChange={e => setFWinPts(e.target.value)}
                  className="w-full bg-transparent border border-green-500/30 rounded-sm px-3 py-2 font-display text-lg text-green-400 text-center focus:outline-none"
                />
              </div>
              <div>
                <p className="font-military text-xs text-red-400/70 tracking-widest mb-1">✗ Puntos si falla</p>
                <input type="number" value={fLosePts} onChange={e => setFLosePts(e.target.value)}
                  className="w-full bg-transparent border border-red-500/30 rounded-sm px-3 py-2 font-display text-lg text-red-400 text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!fText.trim()}
                className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-blue-400 text-blue-400 hover:bg-blue-400/15 disabled:opacity-30 uppercase transition-all"
              >Guardar Pregunta</button>
              <button onClick={() => setView('bank')}
                className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4 transition-colors"
              >← Volver</button>
            </div>
          </>
        )}

        {/* ── ACTIVE VIEW (quiz en vivo) ── */}
        {view === 'active' && activeQ && (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">🧠</span>
              <h3 className="font-display text-2xl tracking-widest text-blue-400">QUIZ EN VIVO</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-slow" />
                <span className="font-military text-blue-400/60 text-xs tracking-widest uppercase">
                  Visible en el mapa ahora
                </span>
              </div>
            </div>

            <div className="p-3 rounded-sm border border-blue-500/30 bg-blue-500/05 mb-4">
              <p className="font-military text-sm text-camp-hueso leading-snug">{activeQ.text}</p>
              <div className="flex items-center gap-2 mt-2 p-2 rounded-sm bg-green-500/10 border border-green-500/30">
                <span className="text-green-400 text-base">✓</span>
                <div>
                  <p className="font-military text-xs text-green-300 font-bold">RESPUESTA CORRECTA: {correctLabel(activeQ)}</p>
                  <p className="font-military text-[10px] text-camp-arena/40 mt-0.5">Marca ✓ solo a equipos que respondieron esto</p>
                </div>
              </div>
            </div>

            <p className="font-military text-camp-arena/40 text-xs tracking-widest mb-2 uppercase">¿Quién respondió correctamente?</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {teams.map(team => {
                const soldier  = SOLDIERS_MAP[team.soldierType];
                const status   = teamStatus[team.id];
                const isEstra  = soldier?.id === 'estratega';
                const isGuard  = soldier?.id === 'guardian';
                const retried  = retryAvailable[team.id];
                return (
                  <div key={team.id}
                    className="flex flex-col gap-1.5 rounded-sm border p-2"
                    style={{ borderColor: `${team.color}40`, backgroundColor: `${team.color}0a` }}
                  >
                    {/* nombre + soldado */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                      <span className="font-military text-xs text-camp-hueso flex-1 truncate">{team.name}</span>
                      {soldier && (
                        <span className="text-xs" title={soldier.name}>{soldier.emoji}</span>
                      )}
                    </div>

                    {/* badge de passivo relevante */}
                    {isEstra && !retried && (
                      <p className="font-military text-[10px] text-camp-dorado/70 leading-none">🧠 Tiene 2ª opc.</p>
                    )}
                    {isGuard && (
                      <p className="font-military text-[10px] text-green-400/70 leading-none">🛡️ Reduce −15% si falla</p>
                    )}
                    {isEstra && retried && status === 'win' && (
                      <p className="font-military text-[10px] text-camp-dorado/70 leading-none">🧠 2ª opc. usada · ½ pts</p>
                    )}

                    {/* botones win/lose */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStatus(team.id, 'win')}
                        className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${
                          status === 'win'
                            ? 'bg-green-500/30 border-green-500/70 text-green-300'
                            : 'border-camp-arena/20 text-camp-arena/30 hover:border-green-500/40'}`}
                      >✓</button>
                      <button
                        onClick={() => setStatus(team.id, 'lose')}
                        className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${
                          status === 'lose'
                            ? 'bg-red-500/30 border-red-500/70 text-red-300'
                            : 'border-camp-arena/20 text-camp-arena/30 hover:border-red-500/40'}`}
                      >✗</button>
                    </div>

                    {/* 2da oportunidad solo para Estrategia cuando fallaron y no usaron retry */}
                    {isEstra && status === 'lose' && !retried && (
                      <button
                        onClick={() => {
                          setRetryAvailable(prev => ({ ...prev, [team.id]: true }));
                          setStatus(team.id, null);
                        }}
                        className="w-full text-[10px] font-military py-0.5 rounded-sm border border-camp-dorado/50 text-camp-dorado hover:bg-camp-dorado/10 transition-all"
                      >🧠 2ª oportunidad</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button onClick={handleApplyResult}
                className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-blue-400 text-blue-400 hover:bg-blue-400/15 uppercase transition-all"
              >✓ Aplicar Resultado</button>
              <button onClick={onClose}
                className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4 transition-colors"
              >Esc</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// ── Modal Decisión (banco) ────────────────────────────────────────
const DecisionModal = ({ teams, onClose, onApply }) => {
  const [view,      setView]      = useState('bank');
  const [decisions, setDecisions] = useState(() => getDecisions());
  const [editing,   setEditing]   = useState(null);
  const [activeD,   setActiveD]   = useState(null);
  const [choice,    setChoice]    = useState({});

  const [fDilemma, setFDilemma] = useState('');
  const [fTextA,   setFTextA]   = useState('');
  const [fDeltaA,  setFDeltaA]  = useState('200');
  const [fTextB,   setFTextB]   = useState('');
  const [fDeltaB,  setFDeltaB]  = useState('-150');

  const refresh = () => setDecisions(getDecisions());

  const openCreate = (d = null) => {
    setEditing(d);
    setFDilemma(d?.dilemma ?? '');
    setFTextA(d?.optionA?.text ?? '');
    setFDeltaA(String(d?.optionA?.delta ?? 200));
    setFTextB(d?.optionB?.text ?? '');
    setFDeltaB(String(d?.optionB?.delta ?? -150));
    setView('create');
  };

  const handleSave = () => {
    if (!fDilemma.trim()) return;
    saveDecision({
      id:      editing?.id ?? Date.now(),
      dilemma: fDilemma.trim(),
      optionA: { text: fTextA.trim() || 'Opción A', delta: parseInt(fDeltaA, 10) || 200  },
      optionB: { text: fTextB.trim() || 'Opción B', delta: parseInt(fDeltaB, 10) || -150 },
    });
    refresh();
    setView('bank');
  };

  const handleDelete = id => { deleteDecision(id); refresh(); };

  const handleLaunch = d => {
    setActiveD(d);
    setChoice({});
    onApply({ type: 'decision-show', decision: d, _silent: true }, []);
    setView('active');
  };

  const toggleChoice = (id, c) =>
    setChoice(prev => ({ ...prev, [id]: prev[id] === c ? null : c }));

  const handleApplyResult = () => {
    if (!activeD) return;
    const teamsA = teams.filter(t => choice[t.id] === 'A');
    const teamsB = teams.filter(t => choice[t.id] === 'B');
    const passiveAdjustments = [];
    const makeUpdate = (team, delta) => {
      const eventType = delta < 0 ? 'penalizacion' : 'bono';
      const adjusted  = Math.round(applyPassive(team, eventType, delta));
      if (adjusted !== delta) {
        const s = SOLDIERS_MAP[team.soldierType];
        passiveAdjustments.push({ teamId: team.id, teamName: team.name, raw: Math.abs(delta), adjusted: Math.abs(adjusted), diff: Math.abs(adjusted) - Math.abs(delta), soldierName: s?.name ?? '', soldierEmoji: s?.emoji ?? '' });
      }
      return { teamId: team.id, newCash: Math.max(0, +team.cash + adjusted) };
    };
    const updates = [
      ...teamsA.map(t => makeUpdate(t, activeD.optionA.delta)),
      ...teamsB.map(t => makeUpdate(t, activeD.optionB.delta)),
    ];
    onApply({ type: 'decision', dilemma: activeD.dilemma, optionA: activeD.optionA, optionB: activeD.optionB, teamsA, teamsB, passiveAdjustments }, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-md border border-amber-500/40 overflow-y-auto max-h-[92vh]"
        style={{ boxShadow: '0 0 40px rgba(245,158,11,0.15)' }}>

        {/* BANK */}
        {view === 'bank' && <>
          <div className="text-center mb-5">
            <span className="text-5xl block mb-2">⚔️</span>
            <h3 className="font-display text-2xl tracking-widest text-amber-400">BANCO DE DECISIONES</h3>
            <p className="font-military text-camp-arena/40 text-sm mt-1">{decisions.length} decisión(es)</p>
          </div>
          {decisions.length === 0
            ? <p className="font-military text-camp-arena/30 text-sm text-center py-8">Sin decisiones — crea la primera</p>
            : <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                {decisions.map(d => (
                  <div key={d.id} className="flex items-start gap-2 p-3 rounded-sm border border-camp-arena/15 hover:border-camp-arena/30 transition-colors">
                    <span className="text-base shrink-0 mt-0.5">⚔️</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-military text-sm text-camp-hueso line-clamp-2">{d.dilemma}</p>
                      <p className="font-military text-xs text-camp-arena/35 mt-0.5">
                        A: {d.optionA.text} ({d.optionA.delta > 0 ? '+' : ''}{d.optionA.delta}) · B: {d.optionB.text} ({d.optionB.delta > 0 ? '+' : ''}{d.optionB.delta})
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      <button onClick={() => openCreate(d)} className="text-xs px-2 py-1 border border-camp-arena/20 text-camp-arena/40 hover:text-camp-arena/70 rounded-sm">✎</button>
                      <button onClick={() => handleDelete(d.id)} className="text-xs px-2 py-1 border border-red-500/20 text-red-400/40 hover:text-red-400 rounded-sm">✕</button>
                      <button onClick={() => handleLaunch(d)} className="text-xs px-3 py-1 border border-amber-400/60 text-amber-400 hover:bg-amber-400/15 rounded-sm font-display tracking-widest">▶</button>
                    </div>
                  </div>
                ))}
              </div>
          }
          <div className="flex gap-2 mt-2">
            <button onClick={() => openCreate()} className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-amber-400 text-amber-400 hover:bg-amber-400/15 uppercase transition-all">+ Nueva Decisión</button>
            <button onClick={onClose} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">Esc</button>
          </div>
        </>}

        {/* CREATE */}
        {view === 'create' && <>
          <div className="text-center mb-5">
            <h3 className="font-display text-2xl tracking-widest text-amber-400">{editing ? 'EDITAR DECISIÓN' : 'NUEVA DECISIÓN'}</h3>
          </div>
          <textarea value={fDilemma} onChange={e => setFDilemma(e.target.value)} placeholder="Describe el dilema aquí…" rows={3} autoFocus
            className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-3 font-military text-sm text-camp-hueso placeholder:text-camp-arena/30 focus:outline-none focus:border-amber-400/50 resize-none mb-4" />
          {[['A', fTextA, setFTextA, fDeltaA, setFDeltaA, '#60a5fa'], ['B', fTextB, setFTextB, fDeltaB, setFDeltaB, '#f59e0b']].map(([label, text, setText, delta, setDelta, color]) => (
            <div key={label} className="rounded-sm border p-3 mb-3 space-y-1.5" style={{ borderColor: `${color}40` }}>
              <span className="font-display text-sm" style={{ color }}>OPCIÓN {label}</span>
              <div className="flex gap-2 mt-1">
                <input value={text} onChange={e => setText(e.target.value)} placeholder={`Descripción opción ${label}`}
                  className="flex-1 bg-transparent border border-camp-arena/20 rounded-sm px-3 py-2 font-military text-xs text-camp-hueso placeholder:text-camp-arena/25 focus:outline-none" />
                <input type="number" value={delta} onChange={e => setDelta(e.target.value)}
                  className="w-24 bg-transparent border rounded-sm px-2 py-2 font-display text-base text-center focus:outline-none"
                  style={{ borderColor: `${color}40`, color }} />
                <span className="font-military text-xs text-camp-arena/40 self-center">pts</span>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={!fDilemma.trim()} className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-amber-400 text-amber-400 hover:bg-amber-400/15 disabled:opacity-30 uppercase transition-all">Guardar Decisión</button>
            <button onClick={() => setView('bank')} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">← Volver</button>
          </div>
        </>}

        {/* ACTIVE */}
        {view === 'active' && activeD && <>
          <div className="text-center mb-4">
            <span className="text-5xl block mb-2">⚔️</span>
            <h3 className="font-display text-2xl tracking-widest text-amber-400">DECISIÓN EN VIVO</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-slow" />
              <span className="font-military text-amber-400/60 text-xs tracking-widest uppercase">Visible en el mapa</span>
            </div>
          </div>
          <div className="p-3 rounded-sm border border-amber-500/30 bg-amber-500/05 mb-4">
            <p className="font-military text-sm text-camp-hueso">{activeD.dilemma}</p>
          </div>
          <p className="font-military text-camp-arena/40 text-xs tracking-widest mb-2 uppercase">Asigna la opción de cada equipo</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {teams.map(team => {
              const soldier = SOLDIERS_MAP[team.soldierType];
              const showGuardian = soldier?.id === 'guardian' &&
                (activeD?.optionA?.delta < 0 || activeD?.optionB?.delta < 0);
              return (
                <div key={team.id} className="flex flex-col gap-1.5 rounded-sm border p-2"
                  style={{ borderColor: `${team.color}40`, backgroundColor: `${team.color}0a` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                    <span className="font-military text-xs text-camp-hueso flex-1 truncate">{team.name}</span>
                    {soldier && <span className="text-xs">{soldier.emoji}</span>}
                  </div>
                  {showGuardian && (
                    <p className="font-military text-[10px] text-green-400/70 leading-none">🛡️ -15% en opción negativa</p>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => toggleChoice(team.id, 'A')}
                      className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${choice[team.id] === 'A' ? 'bg-blue-500/30 border-blue-500/70 text-blue-300' : 'border-camp-arena/20 text-camp-arena/30 hover:border-blue-500/40'}`}>A</button>
                    <button onClick={() => toggleChoice(team.id, 'B')}
                      className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${choice[team.id] === 'B' ? 'bg-amber-500/30 border-amber-500/70 text-amber-300' : 'border-camp-arena/20 text-camp-arena/30 hover:border-amber-500/40'}`}>B</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyResult} className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-amber-400 text-amber-400 hover:bg-amber-400/15 uppercase transition-all">✓ Aplicar Resultado</button>
            <button onClick={onClose} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">Esc</button>
          </div>
        </>}
      </div>
    </div>
  );
};

// ── Modal Misión (banco) ──────────────────────────────────────────
const MisionModal = ({ teams, onClose, onApply }) => {
  const [view,     setView]    = useState('bank');
  const [missions, setMissions] = useState(() => getMissions());
  const [editing,  setEditing] = useState(null);
  const [activeM,  setActiveM] = useState(null);
  const [teamResult, setTeamResult] = useState({});

  const [fTitle,   setFTitle]   = useState('');
  const [fDesc,    setFDesc]    = useState('');
  const [fWinPts,  setFWinPts]  = useState('300');
  const [fLosePts, setFLosePts] = useState('150');
  const [fPhysical, setFPhysical] = useState(false);

  const refresh = () => setMissions(getMissions());

  const openCreate = (m = null) => {
    setEditing(m);
    setFTitle(m?.title ?? '');
    setFDesc(m?.description ?? '');
    setFWinPts(String(m?.winPts ?? 300));
    setFLosePts(String(m?.losePts ?? 150));
    setFPhysical(m?.physical ?? false);
    setView('create');
  };

  const handleSave = () => {
    if (!fTitle.trim()) return;
    saveMission({ id: editing?.id ?? Date.now(), title: fTitle.trim(), description: fDesc.trim(), winPts: parseInt(fWinPts, 10) || 300, losePts: parseInt(fLosePts, 10) || 150, physical: fPhysical });
    refresh();
    setView('bank');
  };

  const handleDelete = id => { deleteMission(id); refresh(); };

  const handleLaunch = m => {
    setActiveM(m);
    setTeamResult({});
    onApply({ type: 'mision-show', mission: m, _silent: true }, []);
    setView('active');
  };

  const setResult = (id, r) =>
    setTeamResult(prev => ({ ...prev, [id]: prev[id] === r ? null : r }));

  const handleApplyResult = () => {
    if (!activeM) return;
    const passTeams = teams.filter(t => teamResult[t.id] === 'pass');
    const failTeams = teams.filter(t => teamResult[t.id] === 'fail');
    if (passTeams.length === 0 && failTeams.length === 0) return;
    const passiveAdjustments = [];
    const makeUpdate = (team, passed) => {
      const basePoints = passed ? activeM.winPts : -activeM.losePts;
      const eventType  = passed && activeM.physical ? 'mision-fisica' : (passed ? 'bono' : 'penalizacion');
      const adjusted   = Math.round(applyPassive(team, eventType, basePoints));
      if (adjusted !== basePoints) {
        const s = SOLDIERS_MAP[team.soldierType];
        passiveAdjustments.push({ teamId: team.id, teamName: team.name, raw: Math.abs(basePoints), adjusted: Math.abs(adjusted), diff: Math.abs(adjusted) - Math.abs(basePoints), soldierName: s?.name ?? '', soldierEmoji: s?.emoji ?? '' });
      }
      return { teamId: team.id, newCash: Math.max(0, +team.cash + adjusted) };
    };
    const updates = [
      ...passTeams.map(t => makeUpdate(t, true)),
      ...failTeams.map(t => makeUpdate(t, false)),
    ];
    const allAffected = [...passTeams, ...failTeams];
    onApply({ type: 'mision', title: activeM.title, description: activeM.description, teams: allAffected, passTeams: passTeams ?? [], failTeams: failTeams ?? [], amount: activeM.winPts, passiveAdjustments }, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-md border border-emerald-500/40 overflow-y-auto max-h-[92vh]"
        style={{ boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}>

        {/* BANK */}
        {view === 'bank' && <>
          <div className="text-center mb-5">
            <span className="text-5xl block mb-2">🎯</span>
            <h3 className="font-display text-2xl tracking-widest text-emerald-400">BANCO DE MISIONES</h3>
            <p className="font-military text-camp-arena/40 text-sm mt-1">{missions.length} misión(es)</p>
          </div>
          {missions.length === 0
            ? <p className="font-military text-camp-arena/30 text-sm text-center py-8">Sin misiones — crea la primera</p>
            : <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                {missions.map(m => (
                  <div key={m.id} className="flex items-start gap-2 p-3 rounded-sm border border-camp-arena/15 hover:border-camp-arena/30 transition-colors">
                    <span className="text-base shrink-0 mt-0.5">🎯</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-military text-sm text-camp-hueso">{m.title}</p>
                      {m.description && <p className="font-military text-xs text-camp-arena/40 mt-0.5 line-clamp-1">{m.description}</p>}
                      <p className="font-military text-xs text-camp-arena/35 mt-0.5">✅ +{m.winPts} / ❌ −{m.losePts} pts</p>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      <button onClick={() => openCreate(m)} className="text-xs px-2 py-1 border border-camp-arena/20 text-camp-arena/40 hover:text-camp-arena/70 rounded-sm">✎</button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs px-2 py-1 border border-red-500/20 text-red-400/40 hover:text-red-400 rounded-sm">✕</button>
                      <button onClick={() => handleLaunch(m)} className="text-xs px-3 py-1 border border-emerald-400/60 text-emerald-400 hover:bg-emerald-400/15 rounded-sm font-display tracking-widest">▶</button>
                    </div>
                  </div>
                ))}
              </div>
          }
          <div className="flex gap-2 mt-2">
            <button onClick={() => openCreate()} className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400/15 uppercase transition-all">+ Nueva Misión</button>
            <button onClick={onClose} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">Esc</button>
          </div>
        </>}

        {/* CREATE */}
        {view === 'create' && <>
          <div className="text-center mb-5">
            <h3 className="font-display text-2xl tracking-widest text-emerald-400">{editing ? 'EDITAR MISIÓN' : 'NUEVA MISIÓN'}</h3>
          </div>
          <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Título de la misión" autoFocus
            className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-3 font-military text-sm text-camp-hueso placeholder:text-camp-arena/30 focus:outline-none focus:border-emerald-400/50 mb-3" />
          <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Descripción del reto (opcional)" rows={2}
            className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-3 font-military text-sm text-camp-hueso placeholder:text-camp-arena/30 focus:outline-none focus:border-emerald-400/50 resize-none mb-4" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <p className="font-military text-xs text-green-400/70 tracking-widest mb-1">✅ Puntos si supera</p>
              <input type="number" value={fWinPts} onChange={e => setFWinPts(e.target.value)}
                className="w-full bg-transparent border border-green-500/30 rounded-sm px-3 py-2 font-display text-lg text-green-400 text-center focus:outline-none" />
            </div>
            <div>
              <p className="font-military text-xs text-red-400/70 tracking-widest mb-1">❌ Puntos si falla</p>
              <input type="number" value={fLosePts} onChange={e => setFLosePts(e.target.value)}
                className="w-full bg-transparent border border-red-500/30 rounded-sm px-3 py-2 font-display text-lg text-red-400 text-center focus:outline-none" />
            </div>
          </div>
          {/* Toggle misión física */}
          <button
            onClick={() => setFPhysical(p => !p)}
            className={`w-full flex items-center gap-3 p-3 rounded-sm border transition-all mb-5 ${fPhysical ? 'border-red-400/60 bg-red-400/08' : 'border-camp-arena/15 hover:border-camp-arena/30'}`}
          >
            <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${fPhysical ? 'border-red-400 bg-red-400/20 text-red-400' : 'border-camp-arena/30 text-transparent'}`}>✓</div>
            <div className="text-left">
              <p className={`font-military text-sm ${fPhysical ? 'text-red-300' : 'text-camp-arena/60'}`}>⚔️ Es misión física</p>
              <p className="font-military text-xs text-camp-arena/30">Guerrero recibe +10% automático al superar</p>
            </div>
          </button>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!fTitle.trim()} className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400/15 disabled:opacity-30 uppercase transition-all">Guardar Misión</button>
            <button onClick={() => setView('bank')} className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">← Volver</button>
          </div>
        </>}

        {/* ACTIVE */}
        {view === 'active' && activeM && <>
          <div className="text-center mb-4">
            <span className="text-5xl block mb-2">🎯</span>
            <h3 className="font-display text-2xl tracking-widest text-emerald-400">MISIÓN EN VIVO</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="font-military text-emerald-400/60 text-xs tracking-widest uppercase">Visible en el mapa</span>
            </div>
          </div>
          <div className="p-3 rounded-sm border border-emerald-500/30 bg-emerald-500/05 mb-4">
            <p className="font-military text-sm text-camp-hueso font-bold">{activeM.title}</p>
            {activeM.description && <p className="font-military text-xs text-camp-arena/60 mt-1">{activeM.description}</p>}
            <p className="font-military text-xs text-camp-arena/35 mt-1.5">✅ +{activeM.winPts} si supera · ❌ −{activeM.losePts} si falla</p>
          </div>
          <p className="font-military text-camp-arena/40 text-xs tracking-widest mb-2 uppercase">Resultado por equipo</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {teams.map(team => {
              const soldier  = SOLDIERS_MAP[team.soldierType];
              const isPhysicalGuerrero = soldier?.id === 'guerrero' && activeM?.physical;
              const status   = teamResult[team.id];
              return (
                <div key={team.id}
                  className="flex flex-col gap-1.5 rounded-sm border p-2"
                  style={{ borderColor: `${team.color}40`, backgroundColor: `${team.color}0a` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                    <span className="font-military text-xs text-camp-hueso flex-1 truncate">{team.name}</span>
                    {soldier && <span className="text-xs">{soldier.emoji}</span>}
                  </div>
                  {isPhysicalGuerrero && (
                    <p className="font-military text-[10px] text-red-400/70 leading-none pl-4">⚔️ +10% si supera</p>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setResult(team.id, 'pass')}
                      className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${
                        status === 'pass'
                          ? 'bg-emerald-500/30 border-emerald-500/70 text-emerald-300'
                          : 'border-camp-arena/20 text-camp-arena/30 hover:border-emerald-500/40'}`}
                    >✅</button>
                    <button
                      onClick={() => setResult(team.id, 'fail')}
                      className={`flex-1 text-xs py-0.5 rounded-sm border transition-all ${
                        status === 'fail'
                          ? 'bg-red-500/30 border-red-500/70 text-red-300'
                          : 'border-camp-arena/20 text-camp-arena/30 hover:border-red-500/40'}`}
                    >❌</button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleApplyResult}
            disabled={Object.values(teamResult).every(v => !v)}
            className="w-full font-display tracking-widest py-3 rounded-sm border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400/15 disabled:opacity-30 uppercase transition-all mb-2"
          >✓ Aplicar Resultado</button>
          <button onClick={onClose} className="w-full font-military text-camp-arena/30 hover:text-camp-arena/60 py-2 text-sm">Cancelar</button>
        </>}
      </div>
    </div>
  );
};

// ── Modal Ruleta (equipo primero → girar en mapa) ─────────────────
const RuletaModal = ({ teams, onClose, onApply, preSelectedTeams = null }) => {
  const [selected,     setSelected]     = useState(() => {
    if (preSelectedTeams === 'all') return teams.map(t => t.id);
    if (Array.isArray(preSelectedTeams)) return preSelectedTeams;
    return [];
  });
  const [result,       setResult]       = useState(null);
  const [spinning,     setSpinning]     = useState(false);
  const [spinIdx,      setSpinIdx]      = useState(0);
  const [explorerUsed, setExplorerUsed] = useState(false);
  const intervalRef = useRef(null);

  // Limpia el intervalo al desmontar para evitar memory leaks
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggle = id => setSelected(prev =>
    prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const doSpin = () => {
    setSpinning(true);
    setResult(null);
    const affectedTeams = teams.filter(t => selected.includes(t.id));
    onApply({ type: 'ruleta-spin', teams: affectedTeams, _silent: true }, []);
    let count = 0;
    const total = 20 + Math.floor(Math.random() * 10);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSpinIdx(prev => (prev + 1) % RULETA_EVENTS.length);
      count++;
      if (count >= total) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setResult(RULETA_EVENTS[Math.floor(Math.random() * RULETA_EVENTS.length)]);
        setSpinning(false);
      }
    }, 120);
  };

  const handleSpin = () => {
    if (selected.length === 0) return;
    doSpin();
  };

  const hasExplorer = selected.some(id => {
    const t = teams.find(t => t.id === id);
    return SOLDIERS_MAP[t?.soldierType]?.id === 'explorador';
  });

  const handleApply = () => {
    if (!result || selected.length === 0) return;
    const affectedTeams = teams.filter(t => selected.includes(t.id));
    const passiveAdjustments = [];
    const updates = affectedTeams.map(t => {
      // Guardián absorbe el 15% en eventos negativos de la ruleta
      const adjusted = result.delta < 0
        ? Math.round(applyPassive(t, 'penalizacion', result.delta))
        : result.delta;
      if (adjusted !== result.delta) {
        const s = SOLDIERS_MAP[t.soldierType];
        passiveAdjustments.push({ teamId: t.id, teamName: t.name, raw: Math.abs(result.delta), adjusted: Math.abs(adjusted), diff: Math.abs(adjusted) - Math.abs(result.delta), soldierName: s?.name ?? '', soldierEmoji: s?.emoji ?? '' });
      }
      return { teamId: t.id, newCash: Math.max(0, +t.cash + adjusted) };
    });
    onApply({ type: 'ruleta', event: result, teams: affectedTeams, amount: Math.abs(result.delta), positive: result.positive, passiveAdjustments }, updates);
    onClose();
  };

  const current = RULETA_EVENTS[spinIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/90 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1f1f1f] rounded-sm p-6 w-full max-w-sm border border-purple-500/40"
        style={{ boxShadow: '0 0 40px rgba(168,85,247,0.15)' }}>
        <div className="text-center mb-5">
          <span className="text-5xl block mb-2">🎲</span>
          <h3 className="font-display text-2xl tracking-widest text-purple-400">RULETA</h3>
          <p className="font-military text-camp-arena/40 text-sm mt-1">Evento al azar para el campo</p>
        </div>

        <p className="font-military text-camp-arena/40 text-xs tracking-widest mb-2 uppercase">¿Qué equipos participan?</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {teams.map(team => {
            const soldier    = SOLDIERS_MAP[team.soldierType];
            const isExplorer = soldier?.id === 'explorador';
            return (
              <button key={team.id} onClick={() => toggle(team.id)} disabled={spinning || !!result}
                className="flex flex-col gap-1 p-2.5 rounded-sm border transition-all disabled:opacity-50 text-left"
                style={{ borderColor: selected.includes(team.id) ? team.color : 'rgba(255,255,255,0.12)', backgroundColor: selected.includes(team.id) ? `${team.color}28` : 'transparent' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                  <span className="font-military text-sm text-camp-hueso flex-1">{team.name}</span>
                  {soldier && <span className="text-xs">{soldier.emoji}</span>}
                  {selected.includes(team.id) && <span className="text-xs text-purple-400">✓</span>}
                </div>
                {isExplorer && selected.includes(team.id) && !explorerUsed && (
                  <p className="font-military text-[10px] text-primary-400/70 leading-none pl-5">🗺️ puede relanzar</p>
                )}
              </button>
            );
          })}
        </div>

        {spinning && (
          <div className="text-center mb-4 py-4 rounded-sm border border-purple-400/25" style={{ background: 'rgba(168,85,247,0.08)' }}>
            <span className="text-4xl">{current.emoji}</span>
            <p className="font-military text-camp-arena/60 text-sm mt-2">Girando en el mapa…</p>
          </div>
        )}

        {result && !spinning && (
          <div className="text-center mb-4 py-4 rounded-sm border animate-zoom-in"
            style={{ borderColor: result.positive ? 'rgba(16,185,129,0.5)' : 'rgba(169,50,38,0.5)', background: result.positive ? 'rgba(16,185,129,0.08)' : 'rgba(169,50,38,0.08)' }}>
            <span className="text-5xl">{result.emoji}</span>
            <p className="font-display text-base tracking-widest mt-2" style={{ color: result.positive ? '#34d399' : '#f87171' }}>{result.name}</p>
            <p className="font-military text-sm" style={{ color: result.positive ? '#34d399' : '#f87171' }}>{result.delta > 0 ? '+' : ''}{result.delta} pts</p>
            <p className="font-military text-camp-arena/30 text-xs mt-2 tracking-widest uppercase">Solo visible aquí — revela cuando estés listo</p>
          </div>
        )}

        {!spinning && !result && (
          <button onClick={handleSpin} disabled={selected.length === 0}
            className="w-full font-display tracking-widest text-xl py-4 rounded-sm border-2 border-purple-400 text-purple-400 hover:bg-purple-400/15 disabled:opacity-30 uppercase transition-all animate-pulse-slow mb-3"
          >🎲 Girar en el Mapa</button>
        )}

        {/* Explorador puede relanzar */}
        {result && !spinning && hasExplorer && !explorerUsed && (
          <button
            onClick={() => { setExplorerUsed(true); doSpin(); }}
            className="w-full font-military text-sm py-2.5 rounded-sm border border-primary-400/60 text-primary-400 hover:bg-primary-400/10 transition-all mb-3"
          >🗺️ EXPLORADOR — Relanzar (1 vez)</button>
        )}

        {result && (
          <div className="flex gap-2 mb-3">
            <button onClick={handleApply}
              className="flex-1 font-display tracking-widest py-3 rounded-sm border-2 border-purple-400 text-purple-400 hover:bg-purple-400/15 uppercase transition-all"
            >✓ Revelar Resultado</button>
            <button onClick={() => { setResult(null); setSpinning(false); }}
              className="font-military text-camp-arena/40 hover:text-camp-arena/70 px-4">↺</button>
          </div>
        )}
        {!result && (
          <button onClick={onClose} className="w-full font-military text-camp-arena/30 hover:text-camp-arena/60 py-2 text-sm">Cancelar</button>
        )}
      </div>
    </div>
  );
};
// ── Componente principal ─────────────────────────────────────────
export const CommandPanel = () => {
  const navigate        = useNavigate();
  const [auth,             setAuth]            = useState(false);
  const [teams,            setTeams]           = useState([]);
  const [alert,            setAlert]           = useState(null);
  const [eventModal,       setEventModal]      = useState(null); // 'bono' | 'emboscada' | 'quiz' | 'decision' | 'mision' | 'ruleta' | null
  const [pendingActivity,  setPendingActivity] = useState(null); // 'emboscada' | 'bono' | 'ruleta'
  const [preSelectedTeams, setPreSelectedTeams] = useState(null); // 'all' | [id] | null

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchTeams = useCallback(async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
      setTeams(data);
    } catch {
      showAlert('error', 'Error al cargar equipos');
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    fetchTeams();
    const id = setInterval(fetchTeams, 10000);
    return () => clearInterval(id);
  }, [auth, fetchTeams]);

  const handleUpdate = (teamId, newCash) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, cash: newCash } : t));
    showAlert('success', 'Puntos actualizados ✓');
  };

  const broadcastEvent = async (payload, teamUpdates = []) => {
    try {
      await Promise.all(
        teamUpdates.map(async ({ teamId, newCash }) => {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/teams/${teamId}`, { cash: newCash });
          handleUpdate(teamId, newCash);
        })
      );
      const ch = new BroadcastChannel('camp-events');
      ch.postMessage(payload);
      ch.close();
      if (!payload._silent) showAlert('success', 'Evento aplicado ✓');
    } catch {
      showAlert('error', 'Error al aplicar el evento');
    }
  };

  const handleQuickEvent = async (teamIds, delta) => {
    const eventType = delta > 0 ? 'bono' : 'penalizacion';
    const passiveAdjustments = [];

    const teamUpdates = teamIds.map(teamId => {
      const team = teams.find(t => t.id === teamId);
      const adjusted = Math.round(applyPassive(team, eventType, delta));
      if (adjusted !== delta) {
        const soldier = SOLDIERS_MAP[team.soldierType];
        passiveAdjustments.push({
          teamId,
          teamName: team.name,
          raw:      Math.abs(delta),
          adjusted: Math.abs(adjusted),
          diff:     Math.abs(adjusted) - Math.abs(delta),
          soldierName:  soldier?.name  ?? '',
          soldierEmoji: soldier?.emoji ?? '',
        });
      }
      return { teamId, newCash: Math.max(0, Number(team.cash) + adjusted) };
    });

    const payload = {
      type:    delta > 0 ? 'bono' : 'emboscada',
      teamIds,
      amount:  Math.abs(delta),
      teams:   teams.filter(t => teamIds.includes(t.id)),
      passiveAdjustments,
    };
    await broadcastEvent(payload, teamUpdates);
  };

  const SORTEABLE = ['quiz', 'decision', 'mision', 'ruleta'];

  const handleSortear = () => {
    const random = SORTEABLE[Math.floor(Math.random() * SORTEABLE.length)];
    if (['emboscada', 'bono', 'ruleta'].includes(random)) {
      setPendingActivity(random);
    } else {
      setEventModal(random);
    }
  };

  const handleScopeSelect = scope => {
    const activity = pendingActivity;
    setPendingActivity(null);
    setPreSelectedTeams(scope === 'all' ? 'all' : [scope]);
    setEventModal(activity);
  };

  if (!auth) return <PinScreen onAuth={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-camp-carbon">
      {alert && <Alert type={alert.type} msg={alert.msg} />}

      {pendingActivity && (
        <ScopePickerModal
          activity={pendingActivity}
          teams={teams}
          onClose={() => setPendingActivity(null)}
          onSelect={handleScopeSelect}
        />
      )}

      {eventModal && ['bono', 'emboscada'].includes(eventModal) && (
        <QuickEventModal
          type={eventModal}
          teams={teams}
          onClose={() => { setEventModal(null); setPreSelectedTeams(null); }}
          onApply={handleQuickEvent}
          preSelectedTeams={preSelectedTeams}
        />
      )}
      {eventModal === 'quiz'     && <QuizModal     teams={teams} onClose={() => {
        const ch = new BroadcastChannel('camp-events');
        ch.postMessage({ type: 'quiz-hide' });
        ch.close();
        setEventModal(null);
      }} onApply={(p, u) => broadcastEvent(p, u)} />}
      {eventModal === 'decision' && <DecisionModal teams={teams} onClose={() => {
        const ch = new BroadcastChannel('camp-events'); ch.postMessage({ type: 'decision-hide' }); ch.close();
        setEventModal(null);
      }} onApply={(p, u) => broadcastEvent(p, u)} />}
      {eventModal === 'mision'   && <MisionModal   teams={teams} onClose={() => {
        const ch = new BroadcastChannel('camp-events'); ch.postMessage({ type: 'mision-hide' }); ch.close();
        setEventModal(null);
      }} onApply={(p, u) => broadcastEvent(p, u)} />}
      {eventModal === 'ruleta'   && <RuletaModal   teams={teams} onClose={() => {
        const ch = new BroadcastChannel('camp-events'); ch.postMessage({ type: 'ruleta-hide' }); ch.close();
        setEventModal(null); setPreSelectedTeams(null);
      }} onApply={(p, u) => broadcastEvent(p, u)} preSelectedTeams={preSelectedTeams} />}

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-glow">🎖️</span>
          <div>
            <h1 className="font-display text-2xl text-camp-hueso tracking-widest leading-none">
              PANEL DEL COMANDANTE
            </h1>
            <p className="font-military text-camp-arena/35 text-xs tracking-widest mt-0.5">
              {teams.length} equipos · sincroniza cada 10s
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/mapa')}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm border transition-all"
            style={{ borderColor: 'rgba(14,165,233,0.5)', color: 'rgba(14,165,233,0.9)', background: 'rgba(14,165,233,0.08)' }}
          >
            🗺️ Ver Mapa
          </button>
          <button
            onClick={() => navigate('/seleccion')}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm border transition-all"
            style={{ borderColor: 'rgba(212,197,169,0.4)', color: 'rgba(212,197,169,0.8)', background: 'rgba(212,197,169,0.06)' }}
          >
            🪖 Soldados
          </button>
          <button
            onClick={() => { setAuth(false); navigate('/'); }}
            className="font-military text-xs tracking-widest uppercase px-4 py-2 rounded-sm border border-red-500/30 text-red-400/60 hover:text-red-400 hover:border-red-500/70 transition-all"
          >
            ✕ Salir
          </button>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-10">

        {/* ── Gestión de equipos ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-xl text-camp-hueso tracking-widest">
              GESTIÓN DE EQUIPOS
            </h2>
            <div className="h-px flex-1 bg-camp-arena/10" />
            <button
              onClick={fetchTeams}
              className="font-military text-xs text-camp-arena/40 hover:text-camp-arena/70 tracking-widest uppercase transition-colors"
            >
              ↻ Sincronizar
            </button>
          </div>

          {teams.length === 0 ? (
            <p className="font-military text-camp-arena/30 text-sm tracking-widest text-center py-12 uppercase">
              Cargando equipos…
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map(team => (
                <TeamControl key={team.id} team={team} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </section>

        {/* ── Eventos del juego ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-display text-xl text-camp-hueso tracking-widest">
              EVENTOS DEL JUEGO
            </h2>
            <div className="h-px flex-1 bg-camp-arena/10" />
            <button
              onClick={handleSortear}
              className="font-military text-xs tracking-widest uppercase px-3 py-1.5 rounded-sm border border-purple-500/35 text-purple-400/70 hover:text-purple-300 hover:border-purple-500/70 hover:bg-purple-500/08 transition-all"
            >
              🎲 Sortear actividad
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Emboscada — abre modal directo (tiene checkboxes internos) */}
            <button
              onClick={() => setEventModal('emboscada')}
              className="group flex flex-col items-center gap-2 py-6 px-3 rounded-sm border border-red-500/35 hover:border-red-500/70 hover:bg-red-500/08 transition-all"
            >
              <span className="text-4xl group-hover:animate-shake">💥</span>
              <p className="font-display text-sm text-red-400 tracking-widest">EMBOSCADA</p>
              <p className="font-military text-[10px] text-camp-arena/35 tracking-wide text-center">
                Resta puntos a equipo(s)
              </p>
            </button>

            {/* Bono de Honor — abre modal directo (tiene checkboxes internos) */}
            <button
              onClick={() => setEventModal('bono')}
              className="group flex flex-col items-center gap-2 py-6 px-3 rounded-sm border border-camp-dorado/40 hover:border-camp-dorado hover:bg-camp-dorado/08 transition-all"
            >
              <span className="text-4xl group-hover:animate-glow">🌟</span>
              <p className="font-display text-sm text-camp-dorado tracking-widest">BONO DE HONOR</p>
              <p className="font-military text-[10px] text-camp-arena/35 tracking-wide text-center">
                Suma puntos a equipo(s)
              </p>
            </button>

            {[
              { emoji: '❓', label: 'QUIZ',     desc: 'Preguntas con tiempo', key: 'quiz',     color: 'rgba(96,165,250,0.35)',  hoverBg: 'rgba(96,165,250,0.08)',  text: '#60a5fa' },
              { emoji: '⚔️', label: 'DECISIÓN', desc: 'Dilemas de equipo',   key: 'decision', color: 'rgba(245,158,11,0.35)', hoverBg: 'rgba(245,158,11,0.08)', text: '#f59e0b' },
              { emoji: '🎯', label: 'MISIÓN',   desc: 'Retos cronometrados',  key: 'mision',   color: 'rgba(16,185,129,0.35)',  hoverBg: 'rgba(16,185,129,0.08)',  text: '#34d399' },
              { emoji: '🎲', label: 'RULETA',   desc: 'Evento al azar',       key: 'ruleta',   color: 'rgba(168,85,247,0.35)',  hoverBg: 'rgba(168,85,247,0.08)',  text: '#c084fc' },
            ].map(ev => (
              <button
                key={ev.label}
                onClick={() => ev.key === 'ruleta' ? setPendingActivity('ruleta') : setEventModal(ev.key)}
                className="group flex flex-col items-center gap-2 py-6 px-3 rounded-sm border transition-all"
                style={{ borderColor: ev.color }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = ev.hoverBg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="text-4xl">{ev.emoji}</span>
                <p className="font-display text-sm tracking-widest" style={{ color: ev.text }}>{ev.label}</p>
                <p className="font-military text-[10px] text-camp-arena/35 tracking-wide text-center">{ev.desc}</p>
              </button>
            ))}
          </div>

          <p className="font-military text-camp-arena/20 text-xs tracking-widest text-center mt-5 uppercase">
            6 eventos activos — Ruleta pide alcance antes de abrir · Sortear elige entre Quiz, Decisión, Misión y Ruleta
          </p>
        </section>

      </div>
    </div>
  );
};
