export const isNameUnique = (name, hierarchy) => {
    return !hierarchy.some(level => level.toLowerCase() === name.toLowerCase());
  };

export const isEntityNameUnique = (name, entities) => {
  return !Object.values(entities).flat().some(
    entity => entity.name.toLowerCase() === name.toLowerCase()
  );
};