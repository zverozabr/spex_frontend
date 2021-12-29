export const getFromStorage = (name) => localStorage.getItem(name);

export const saveToStorage = (name, value) => localStorage.setItem(name, value);

export const removeFromStorage = (name) => localStorage.removeItem(name);
