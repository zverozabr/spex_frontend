const required = (value) => {
  if (Array.isArray(value)) {
    return value.length ? undefined : 'Required';
  }
  return value || value === 0 ? undefined : 'Required';
};

const Validators = {
  required,
};

export default Validators;
