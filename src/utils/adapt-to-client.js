export const adaptToClient = (point) => {

  const camelCase = (string) => string.toLowerCase().split('_').map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('');

  const result = {};
  for (const key in point) {
    result[camelCase(key)] = point[key];

  }

  return result;
};
