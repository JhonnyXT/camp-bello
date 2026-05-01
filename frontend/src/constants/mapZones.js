/**
 * Zonas del mapa de campaña.
 * Las posiciones se calculan por porcentaje respecto al líder
 * (getZone en utils/game.js), no por valor absoluto — así funciona
 * a cualquier escala de puntos.
 */
export const MAP_ZONES = [
  {
    id:          'base',
    name:        'BASE RECLUTA',
    emoji:       '🏕️',
    rangeLabel:  '0 % – 20 %',
    description: 'El campamento base. La aventura empieza aquí.',
    verse:       'Fil 4:13 — Todo lo puedo en Cristo',
    bgClass:     'from-camp-verde/15 to-transparent',
    borderClass: 'border-camp-verde/30',
    glowClass:   'shadow-[inset_4px_0_0_rgba(61,90,62,0.5)]',
  },
  {
    id:          'desierto',
    name:        'EL DESIERTO',
    emoji:       '🏜️',
    rangeLabel:  '20 % – 40 %',
    description: 'Las arenas ponen a prueba la resistencia del recluta.',
    verse:       'Sal 23:4 — Aunque ande en valle de sombra',
    bgClass:     'from-camp-arena/15 to-transparent',
    borderClass: 'border-camp-arena/30',
    glowClass:   'shadow-[inset_4px_0_0_rgba(212,197,169,0.5)]',
  },
  {
    id:          'monte',
    name:        'MONTE DE PRUEBA',
    emoji:       '⛰️',
    rangeLabel:  '40 % – 60 %',
    description: 'La cumbre solo la alcanza quien persevera.',
    verse:       'Is 40:31 — Correrán y no se cansarán',
    bgClass:     'from-primary-700/15 to-transparent',
    borderClass: 'border-primary-500/30',
    glowClass:   'shadow-[inset_4px_0_0_rgba(14,165,233,0.4)]',
  },
  {
    id:          'batalla',
    name:        'CAMPO DE BATALLA',
    emoji:       '⚔️',
    rangeLabel:  '60 % – 80 %',
    description: 'La batalla prueba el carácter y la fe del soldado.',
    verse:       'Ef 6:11 — Vestíos de toda la armadura de Dios',
    bgClass:     'from-camp-rojo/15 to-transparent',
    borderClass: 'border-camp-rojo/30',
    glowClass:   'shadow-[inset_4px_0_0_rgba(169,50,38,0.5)]',
  },
  {
    id:          'fortaleza',
    name:        'LA FORTALEZA',
    emoji:       '🏰',
    rangeLabel:  '80 % – 100 %',
    description: 'Solo los fieles llegan a la Fortaleza de Cristo.',
    verse:       '2 Tim 2:3 — Sufre penalidades como buen soldado',
    bgClass:     'from-camp-dorado/20 to-transparent',
    borderClass: 'border-camp-dorado/50',
    glowClass:   'shadow-[inset_4px_0_0_rgba(200,146,42,0.6)]',
  },
];

/** Mapa rápido id → zona */
export const ZONES_MAP = Object.fromEntries(MAP_ZONES.map(z => [z.id, z]));
