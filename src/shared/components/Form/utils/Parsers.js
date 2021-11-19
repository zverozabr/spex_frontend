const number = (value) => (isNaN(parseFloat(value)) ? null : parseFloat(value));

const numberBetween = (value, min, max) => Math.min(max, Math.max(min, number(value)));

const omeroIds = (value) => value.map((el) => el.id || el);

const channels = (value) => value.map((el) => el.value || el);

const Parsers = {
  number,
  numberBetween,
  omeroIds,
  channels,
};

export default Parsers;
