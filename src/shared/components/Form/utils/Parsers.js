const number = (value) => (isNaN(parseFloat(value)) ? null : parseFloat(value));

const Parsers = {
  number,
};

export default Parsers;
