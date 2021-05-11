const hash = (arr, key) => arr.reduce((acc, el) => ({ ...acc, [el[key]]: el }), {});

export default hash;
