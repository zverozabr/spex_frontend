import get from 'lodash/get';

const required = (value) => {
  if (Array.isArray(value)) {
    return value.length ? undefined : 'Required';
  }
  return value || value === 0 ? undefined : 'Required';
};

// @see: https://github.com/final-form/react-final-form/issues/372
const requiredConditional = (fieldName) => (value, allValues) => get(allValues, fieldName) ? required(value) : undefined;

const Validators = {
  required,
  requiredConditional,
};

export default Validators;
