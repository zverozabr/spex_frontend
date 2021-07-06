import get from 'lodash/get';

const required = (value) => {
  if (Array.isArray(value)) {
    return value.length ? undefined : 'Required';
  }
  return value != null ? undefined : 'Required';
};

// @see: https://github.com/final-form/react-final-form/issues/372
const requiredConditional = (fieldName) => (value, allValues) => {
  const conditionalFieldValue = get(allValues, fieldName);
  if (Array.isArray(conditionalFieldValue)) {
    return conditionalFieldValue.length ? required(value) : undefined;
  }
  return conditionalFieldValue ? required(value) : undefined;
};

const Validators = {
  required,
  requiredConditional,
};

export default Validators;
