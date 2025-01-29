export const adaptToServer = (point) => {

  const result = {};

  for (const key in point) {

    const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeCaseKey] = point[key];

  }
};
