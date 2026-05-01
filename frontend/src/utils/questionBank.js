const makeBank = key => {
  const getAll = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const save   = item => {
    const all = getAll();
    const idx = all.findIndex(x => x.id === item.id);
    if (idx >= 0) all[idx] = item; else all.push(item);
    localStorage.setItem(key, JSON.stringify(all));
  };
  const remove = id => localStorage.setItem(key, JSON.stringify(getAll().filter(x => x.id !== id)));
  return { getAll, save, remove };
};

// Preguntas (quiz)
const qb = makeBank('camp-questions');
export const getQuestions   = qb.getAll;
export const saveQuestion   = qb.save;
export const deleteQuestion = qb.remove;

// Decisiones
const db = makeBank('camp-decisions');
export const getDecisions   = db.getAll;
export const saveDecision   = db.save;
export const deleteDecision = db.remove;

// Misiones
const mb = makeBank('camp-missions');
export const getMissions   = mb.getAll;
export const saveMission   = mb.save;
export const deleteMission = mb.remove;
