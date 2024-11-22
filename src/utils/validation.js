export const isNameUnique = (name, hierarchy) => {
    return !hierarchy.some(level => level.toLowerCase() === name.toLowerCase());
  };