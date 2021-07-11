const number = (value) => (isNaN(parseFloat(value)) ? null : parseFloat(value));

const numberBetween = (value, min, max) => Math.min(max, Math.max(min, number(value)));

const Parsers = {
  number,
  numberBetween,
};

export default Parsers;
