import { MAP_ZONES } from '../constants/mapZones';
import { SOLDIERS_MAP } from '../constants/soldiers';

/**
 * Calcula la zona de un equipo basándose en su porcentaje
 * respecto al puntaje máximo actual (líder = 100%).
 * Funciona a cualquier escala de puntos.
 */
export const getZone = (cash, maxCash) => {
  const pct = maxCash > 0 ? (Number(cash) / maxCash) * 100 : 0;
  if (pct >= 80) return MAP_ZONES[4]; // La Fortaleza
  if (pct >= 60) return MAP_ZONES[3]; // Campo de Batalla
  if (pct >= 40) return MAP_ZONES[2]; // Monte de Prueba
  if (pct >= 20) return MAP_ZONES[1]; // El Desierto
  return MAP_ZONES[0];                // Base Recluta
};

/**
 * Aplica el bonus pasivo del soldado de un equipo a los puntos de un evento.
 * Retorna los puntos finales ya ajustados.
 *
 * @param {object} team       - Objeto del equipo (con soldierType y cash)
 * @param {string} eventType  - 'quiz' | 'mision-fisica' | 'penalizacion' | 'bono'
 * @param {number} basePoints - Puntos base del evento (positivos o negativos)
 * @returns {number}          - Puntos finales con bonus aplicado
 */
export const applyPassive = (team, eventType, basePoints) => {
  const soldier = SOLDIERS_MAP[team.soldierType];
  if (!soldier) return basePoints;

  switch (soldier.id) {
    case 'guerrero':
      // +10% en misiones físicas
      if (eventType === 'mision-fisica') return Math.round(basePoints * 1.10);
      return basePoints;

    case 'estratega':
      // Segunda oportunidad en quiz: no aplica reducción aquí,
      // se maneja en la lógica del QuizScreen.
      return basePoints;

    case 'guardian':
      // Reduce penalizaciones 15%
      if (basePoints < 0) return Math.round(basePoints * 0.85);
      return basePoints;

    case 'explorador':
      // Puede elegir el siguiente evento: no modifica puntos base.
      return basePoints;

    default:
      return basePoints;
  }
};

/**
 * Calcula el porcentaje de progreso de un equipo respecto al líder.
 * Devuelve un valor entre 0 y 100.
 */
export const getProgressPct = (cash, maxCash) => {
  if (!maxCash || maxCash === 0) return 0;
  return Math.min(100, Math.round((Number(cash) / maxCash) * 100));
};

/**
 * Formatea un número de puntos con separador de miles.
 */
export const formatPoints = (cash) =>
  Number(cash).toLocaleString('es-CO');

/**
 * Retorna la info del passivo relevante de un equipo para un tipo de evento.
 * Usada para mostrar badges en la UI de los modales.
 *
 * @param {object} team      - Objeto equipo (con soldierType)
 * @param {string} eventType - 'quiz' | 'mision-fisica' | 'penalizacion' | 'ruleta'
 * @returns {{ label, color, emoji, desc } | null}
 */
export const getPassiveInfo = (team, eventType) => {
  const soldier = SOLDIERS_MAP[team.soldierType];
  if (!soldier) return null;
  switch (soldier.id) {
    case 'guerrero':
      return eventType === 'mision-fisica'
        ? { label: '+10%', color: '#f87171', emoji: '⚔️', desc: 'Bono físico' } : null;
    case 'estratega':
      return eventType === 'quiz'
        ? { label: '2ª opc.', color: '#C8922A', emoji: '🧠', desc: 'Segunda oportunidad' } : null;
    case 'guardian':
      return eventType === 'penalizacion'
        ? { label: '-15% penal.', color: '#4ade80', emoji: '🛡️', desc: 'Absorbe el 15%' } : null;
    case 'explorador':
      return eventType === 'ruleta'
        ? { label: 'relanzar', color: '#38bdf8', emoji: '🗺️', desc: 'Puede relanzar' } : null;
    default:
      return null;
  }
};
