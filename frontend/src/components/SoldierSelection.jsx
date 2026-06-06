import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';
import { SOLDIERS, STAT_KEYS } from '../constants/soldiers';

// ── Barras de stats ───────────────────────────────────────────────────────────
const StatDots = ({ stats, dotClass }) => (
  <div className="space-y-2">
    {STAT_KEYS.map(stat => (
      <div key={stat} className="flex items-center gap-3">
        <span className="font-military text-xs text-camp-arena/50 w-20 uppercase tracking-widest shrink-0">
          {stat}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm transition-all ${
                i < stats[stat] ? `${dotClass} opacity-85` : 'bg-camp-arena/10'
              }`}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ── Tarjeta de arquetipo ──────────────────────────────────────────────────────
const SoldierCard = ({ soldier, soldierIndex, assignedTeams, onAssign, onUnassign, canAssign }) => {
  const hasTeams = assignedTeams.length > 0;

  return (
    <div
      className={`
        relative flex flex-col rounded-sm border bg-gradient-to-b
        ${soldier.bgClass} ${soldier.borderClass}
        ${hasTeams ? `${soldier.activeGlowClass} border-opacity-100` : `${soldier.glowClass} border-opacity-40 hover:border-opacity-75`}
        transition-all duration-300 p-7
      `}
    >
      {/* Indicador vivo cuando tiene equipo */}
      {hasTeams && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-camp-dorado animate-pulse" />
      )}

      {/* Emoji + nombre */}
      <div className="text-center mb-5">
        <span
          className="text-6xl block mb-3 animate-march"
          style={{ animationDelay: `${soldierIndex * 0.25}s` }}
        >
          {soldier.emoji}
        </span>
        <h2 className="font-display text-4xl text-camp-hueso tracking-widest leading-none">
          {soldier.name}
        </h2>
        <p className="font-military text-camp-arena/55 text-base tracking-wide mt-2">
          {soldier.tagline}
        </p>
      </div>

      {/* Bonus pasivo */}
      <div className={`rounded-sm px-4 py-3 mb-5 text-center ${soldier.badgeClass}`}>
        <p className="font-military text-xs uppercase tracking-[0.2em] opacity-70">⚡ Bonus pasivo</p>
        <p className="font-military text-base mt-1 font-semibold leading-snug">{soldier.passive}</p>
      </div>

      {/* Stats */}
      <div className="mb-5">
        <StatDots stats={soldier.stats} dotClass={soldier.dotClass} />
      </div>

      {/* Versículo */}
      <p className="font-military text-camp-arena/40 text-xs italic text-center mb-5 leading-relaxed">
        &ldquo;{soldier.verseText}&rdquo;<br />— {soldier.verse}
      </p>

      {/* Equipos asignados */}
      {hasTeams && (
        <div className="flex flex-wrap gap-2 mb-4">
          {assignedTeams.map(team => (
            <span
              key={team.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-military ${soldier.badgeClass}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: team.color }}
              />
              {team.name}
              <button
                onClick={() => onUnassign(team.id)}
                className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity leading-none text-base"
                aria-label={`Quitar a ${team.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Botón asignar */}
      {canAssign && (
        <button
          onClick={() => onAssign(soldier.id)}
          className={`
            mt-auto w-full font-military tracking-widest text-sm py-3 rounded-sm border
            ${soldier.borderClass} text-camp-arena/60
            hover:text-camp-hueso hover:bg-white/5
            transition-all duration-200 uppercase
          `}
        >
          + Asignar equipo
        </button>
      )}
    </div>
  );
};

// ── Modal de creación de equipo ───────────────────────────────────────────────
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
];

const CreateTeamModal = ({ onClose, onCreated }) => {
  const [name,    setName]    = useState('');
  const [color,   setColor]   = useState('#ef4444');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/teams`,
        { name: name.trim(), cash: 0, color }
      );
      onCreated(data.user);
      onClose();
    } catch {
      setError('Error al crear el equipo. Intenta de nuevo.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/85 backdrop-blur-sm px-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-camp-carbon border border-camp-dorado/40 rounded-sm p-6 w-full max-w-sm shadow-xl animate-zoom-in">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">⚔️</span>
          <h3 className="font-display text-2xl text-camp-hueso tracking-widest">
            NUEVO EQUIPO
          </h3>
          <p className="font-military text-camp-arena/45 text-sm mt-1">
            Registra un equipo antes de la batalla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="font-military text-[11px] text-camp-arena/50 tracking-widest uppercase block mb-1.5">
              Nombre del equipo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Los Valientes"
              autoFocus
              className="w-full bg-transparent border border-camp-arena/25 rounded-sm px-4 py-2.5
                         font-military text-camp-hueso placeholder:text-camp-arena/25
                         focus:outline-none focus:border-camp-dorado/60 transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="font-military text-[11px] text-camp-arena/50 tracking-widest uppercase block mb-2">
              Color del equipo
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-sm border-2 transition-all ${
                    color === c ? 'border-camp-dorado scale-110' : 'border-transparent hover:border-camp-arena/40'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label className="w-8 h-8 rounded-sm border-2 border-camp-arena/25 hover:border-camp-arena/50 cursor-pointer flex items-center justify-center transition-colors" title="Color personalizado">
                <span className="font-military text-camp-arena/50 text-xs">+</span>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="sr-only" />
              </label>
            </div>
            {/* Preview */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-sm border border-camp-arena/15 bg-white/5">
              <span className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white/20" style={{ backgroundColor: color }} />
              <span className="font-military text-camp-arena/60 text-sm">{name || 'Nombre del equipo'}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-military text-camp-rojo text-sm tracking-wide animate-fade-in">{error}</p>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-military text-camp-arena/40 text-sm hover:text-camp-arena/70 transition-colors uppercase tracking-widest py-2.5 border border-camp-arena/15 rounded-sm hover:border-camp-arena/30"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 font-military tracking-widest text-sm py-2.5 rounded-sm border border-camp-dorado/60 text-camp-dorado hover:bg-camp-dorado hover:text-camp-carbon transition-all duration-200 uppercase disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
export const SoldierSelection = () => {
  const navigate = useNavigate();
  const [teams,           setTeams]           = useState([]);
  const [assignments,     setAssignments]     = useState({}); // { teamId: soldierType }
  const [pickerFor,       setPickerFor]       = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [alert,           setAlert]           = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams`);
        setTeams(data);
        const initial = {};
        data.forEach(t => { if (t.soldierType) initial[t.id] = t.soldierType; });
        setAssignments(initial);
      } catch {
        setAlert({ type: 'error', msg: 'Error al cargar los equipos' });
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Cerrar picker o modal con Escape
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        else setPickerFor(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCreateModal]);

  const assignTeam = (teamId, soldierType) => {
    setAssignments(prev => ({ ...prev, [teamId]: soldierType }));
    setPickerFor(null);
  };

  const unassignTeam = teamId => {
    setAssignments(prev => { const n = { ...prev }; delete n[teamId]; return n; });
  };

  const teamsForSoldier  = soldierType => teams.filter(t => assignments[t.id] === soldierType);
  const unassignedTeams  = teams.filter(t => !assignments[t.id]);
  const assignedCount    = teams.length - unassignedTeams.length;
  const allAssigned      = teams.length > 0 && unassignedTeams.length === 0;
  const pickerSoldier    = SOLDIERS.find(s => s.id === pickerFor);

  const handleTeamCreated = newTeam => {
    setTeams(prev => [...prev, newTeam]);
    setAlert({ type: 'success', msg: `Equipo "${newTeam.name}" creado ✓` });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleBattle = async () => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        Object.entries(assignments).map(([teamId, soldierType]) =>
          axios.put(
            `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/soldier`,
            { soldierType }
          ).then(() => ({ teamId, ok: true }))
           .catch(() => ({ teamId, ok: false }))
        )
      );
      const failed = results
        .filter(r => r.status === 'fulfilled' && !r.value.ok)
        .map(r => teams.find(t => String(t.id) === String(r.value.teamId))?.name)
        .filter(Boolean);

      if (failed.length > 0) {
        setAlert({ type: 'error', msg: `Error al guardar: ${failed.join(', ')}. Intenta de nuevo.` });
        setSaving(false);
      } else {
        navigate('/mapa');
      }
    } catch {
      setAlert({ type: 'error', msg: 'Error inesperado. Intenta de nuevo.' });
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-camp-carbon overflow-x-hidden">
      {alert && <Alert type={alert.type} msg={alert.msg} />}

      {/* ── Header ── */}
      <header className="py-10 px-6 text-center">
        <p className="font-military text-camp-arena/45 tracking-[0.45em] text-xs uppercase mb-2">
          ★ &nbsp;Paso 1 de 2&nbsp; ★
        </p>
        <h1 className="font-display text-5xl sm:text-7xl text-camp-hueso tracking-widest leading-none">
          SELECCIÓN DE
        </h1>
        <h1 className="font-display text-5xl sm:text-7xl text-camp-dorado tracking-widest leading-none">
          SOLDADO
        </h1>
        <p className="font-military text-camp-arena/50 text-base sm:text-lg mt-3 tracking-wide">
          Cada equipo elige su rango antes de la batalla
        </p>
      </header>

      {/* ── Barra de progreso ── */}
      {teams.length > 0 && (
        <div className="px-6 mb-8 max-w-4xl mx-auto">
          <div className="flex justify-between mb-1">
            <span className="font-military text-[11px] text-camp-arena/35 tracking-widest uppercase">
              Equipos asignados
            </span>
            <span className="font-military text-[11px] text-camp-dorado tracking-widest">
              {assignedCount} / {teams.length}
            </span>
          </div>
          <div className="h-1 bg-camp-arena/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-camp-dorado transition-all duration-500 ease-out rounded-full"
              style={{ width: `${teams.length ? (assignedCount / teams.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Grid de arquetipos ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <p className="font-military text-camp-arena/40 tracking-widest uppercase text-sm animate-pulse">
            Cargando equipos...
          </p>
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-screen-2xl mx-auto">
          {SOLDIERS.map((soldier, idx) => (
            <SoldierCard
              key={soldier.id}
              soldier={soldier}
              soldierIndex={idx}
              assignedTeams={teamsForSoldier(soldier.id)}
              onAssign={soldierType => setPickerFor(soldierType)}
              onUnassign={unassignTeam}
              canAssign={unassignedTeams.length > 0}
            />
          ))}
        </div>
      )}

      {/* ── Equipos sin asignar ── */}
      {!loading && unassignedTeams.length > 0 && (
        <div className="px-6 pb-4 max-w-4xl mx-auto">
          <p className="font-military text-camp-arena/35 text-[11px] tracking-widest uppercase mb-2">
            Sin asignar
          </p>
          <div className="flex flex-wrap gap-2">
            {unassignedTeams.map(team => (
              <span
                key={team.id}
                className="font-military text-sm px-3 py-1 rounded-sm border border-camp-arena/20 text-camp-arena/55 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                {team.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="px-6 py-10 flex flex-col items-center gap-4 max-w-md mx-auto">
        <button
          onClick={handleBattle}
          disabled={saving || teams.length === 0 || !allAssigned}
          className={`
            w-full font-display tracking-[0.2em] text-xl sm:text-2xl py-5 rounded-sm
            border-2 transition-all duration-300 uppercase
            ${allAssigned
              ? 'border-camp-dorado text-camp-dorado hover:bg-camp-dorado hover:text-camp-carbon animate-pulse-slow hover:animate-none cursor-pointer'
              : 'border-camp-arena/20 text-camp-arena/30 cursor-not-allowed'
            }
            ${saving ? 'opacity-50' : ''}
          `}
        >
          {saving ? '⏳ Guardando...' : '⚔️  ¡AL CAMPO DE BATALLA!'}
        </button>

        {!allAssigned && teams.length > 0 && (
          <p className="font-military text-camp-arena/30 text-xs text-center tracking-wide">
            {unassignedTeams.length} equipo{unassignedTeams.length !== 1 ? 's' : ''} pendiente{unassignedTeams.length !== 1 ? 's' : ''} de asignar
          </p>
        )}

        <button
          onClick={() => setShowCreateModal(true)}
          className="font-military text-camp-arena/45 text-sm hover:text-camp-dorado/80 transition-colors tracking-widest uppercase border border-camp-arena/20 hover:border-camp-dorado/40 rounded-sm px-5 py-2.5"
        >
          + Crear equipo
        </button>

        {teams.length === 0 && !loading && (
          <p className="font-military text-camp-arena/35 text-xs text-center tracking-wide">
            Aún no hay equipos. Crea el primero para comenzar.
          </p>
        )}

        <button
          onClick={() => navigate('/')}
          className="font-military text-camp-arena/30 text-sm hover:text-camp-arena/60 transition-colors tracking-widest uppercase"
        >
          ← Volver a la portada
        </button>
      </div>

      {/* ── Modal: crear equipo ── */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTeamCreated}
        />
      )}

      {/* ── Overlay: picker de equipo ── */}
      {pickerFor && pickerSoldier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-camp-carbon/85 backdrop-blur-sm px-6"
          onClick={e => { if (e.target === e.currentTarget) setPickerFor(null); }}
        >
          <div className={`bg-camp-carbon border rounded-sm p-6 w-full max-w-sm ${pickerSoldier.borderClass} ${pickerSoldier.activeGlowClass}`}>
            {/* Encabezado del picker */}
            <div className="text-center mb-6">
              <span className="text-4xl block mb-2">{pickerSoldier.emoji}</span>
              <h3 className="font-display text-2xl text-camp-hueso tracking-widest">
                {pickerSoldier.name}
              </h3>
              <p className="font-military text-camp-arena/45 text-sm mt-1">
                ¿Qué equipo tendrá este rango?
              </p>
            </div>

            {/* Lista de equipos disponibles */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {unassignedTeams.length === 0 ? (
                <p className="font-military text-camp-arena/40 text-sm text-center py-6">
                  Todos los equipos ya tienen rango asignado
                </p>
              ) : (
                unassignedTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => assignTeam(team.id, pickerFor)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-sm border border-camp-arena/20 hover:border-camp-arena/50 text-camp-hueso hover:bg-white/5 transition-all duration-200 group"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-military tracking-wide text-base">{team.name}</span>
                    <span className="ml-auto font-military text-xs text-camp-arena/30 group-hover:text-camp-dorado transition-colors">
                      Seleccionar →
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setPickerFor(null)}
              className="w-full mt-5 font-military text-camp-arena/35 text-sm hover:text-camp-arena/65 transition-colors uppercase tracking-widest py-2"
            >
              Cancelar (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
