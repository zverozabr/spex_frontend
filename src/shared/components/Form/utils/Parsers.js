const number = (value) => (isNaN(parseFloat(value)) ? '' : parseFloat(value));

const Parsers = {
  number,
};

export default Parsers;
