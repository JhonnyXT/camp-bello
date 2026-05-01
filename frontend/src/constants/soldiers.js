/**
 * Arquetipos de soldado disponibles en la Campaña del Soldado.
 * Las clases Tailwind deben ser strings completos para que JIT las detecte.
 */
export const SOLDIERS = [
  {
    id: 'guerrero',
    name: 'GUERRERO',
    emoji: '⚔️',
    tagline: 'Fuerza bruta. Nunca retrocede.',
    description: 'El primero en entrar al campo. No conoce el miedo ni la rendición.',
    passive: '+10 pts extra en misiones de desafío físico',
    verse: 'Fil 4:13',
    verseText: 'Todo lo puedo en Cristo que me fortalece',
    borderClass:       'border-camp-rojo',
    glowClass:         'hover:shadow-[0_0_28px_rgba(169,50,38,0.45)]',
    activeGlowClass:   'shadow-[0_0_35px_rgba(169,50,38,0.65)]',
    badgeClass:        'bg-camp-rojo/20 text-red-400 border border-camp-rojo/50',
    bgClass:           'from-red-950/60 to-camp-carbon',
    dotClass:          'bg-red-400',
    accentColor:       '#A93226',
    stats: { fuerza: 5, estrategia: 2, defensa: 3, exploración: 2 },
  },
  {
    id: 'estratega',
    name: 'ESTRATEGA',
    emoji: '🧠',
    tagline: 'Mente táctica. Un paso adelante.',
    description: 'Planifica cada movimiento. La sabiduría es el arma más poderosa.',
    passive: 'Segunda oportunidad en quizzes antes de penalizar',
    verse: 'Prov 3:13',
    verseText: 'Bienaventurado el que halla sabiduría',
    borderClass:       'border-camp-dorado',
    glowClass:         'hover:shadow-[0_0_28px_rgba(200,146,42,0.45)]',
    activeGlowClass:   'shadow-[0_0_35px_rgba(200,146,42,0.65)]',
    badgeClass:        'bg-camp-dorado/20 text-camp-dorado border border-camp-dorado/50',
    bgClass:           'from-amber-950/60 to-camp-carbon',
    dotClass:          'bg-camp-dorado',
    accentColor:       '#C8922A',
    stats: { fuerza: 2, estrategia: 5, defensa: 2, exploración: 3 },
  },
  {
    id: 'guardian',
    name: 'GUARDIÁN',
    emoji: '🛡️',
    tagline: 'Escudo del equipo. Protege a los suyos.',
    description: 'Absorbe el daño. Su fe inquebrantable es su fortaleza.',
    passive: 'Reduce penalizaciones un 15%',
    verse: 'Sal 18:2',
    verseText: 'El Señor es mi roca y mi libertador',
    borderClass:       'border-camp-verde',
    glowClass:         'hover:shadow-[0_0_28px_rgba(61,90,62,0.55)]',
    activeGlowClass:   'shadow-[0_0_35px_rgba(61,90,62,0.75)]',
    badgeClass:        'bg-camp-verde/20 text-green-400 border border-camp-verde/50',
    bgClass:           'from-green-950/60 to-camp-carbon',
    dotClass:          'bg-green-400',
    accentColor:       '#3D5A3E',
    stats: { fuerza: 3, estrategia: 2, defensa: 5, exploración: 2 },
  },
  {
    id: 'explorador',
    name: 'EXPLORADOR',
    emoji: '🗺️',
    tagline: 'Descubridor de rutas. Ve lo que nadie ve.',
    description: 'Siempre hay otro camino. Mapea el territorio antes de actuar.',
    passive: 'Puede elegir el siguiente evento del mapa',
    verse: 'Sal 37:3',
    verseText: 'Fía en Jehová y sigue el bien',
    borderClass:       'border-primary-500',
    glowClass:         'hover:shadow-[0_0_28px_rgba(14,165,233,0.4)]',
    activeGlowClass:   'shadow-[0_0_35px_rgba(14,165,233,0.55)]',
    badgeClass:        'bg-primary-500/20 text-primary-400 border border-primary-500/50',
    bgClass:           'from-blue-950/60 to-camp-carbon',
    dotClass:          'bg-primary-400',
    accentColor:       '#0ea5e9',
    stats: { fuerza: 2, estrategia: 3, defensa: 2, exploración: 5 },
  },
];

/** Mapa rápido soldierType → objeto completo */
export const SOLDIERS_MAP = Object.fromEntries(SOLDIERS.map(s => [s.id, s]));

/** Nombres de stats para renderizar en orden */
export const STAT_KEYS = ['fuerza', 'estrategia', 'defensa', 'exploración'];
