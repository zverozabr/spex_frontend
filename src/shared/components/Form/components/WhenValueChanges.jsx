/* eslint-disable react/prop-types, react/react-in-jsx-scope */
import { useEffect } from 'react';
import { useForm } from 'react-final-form';

const WhenValueChanges = ({ value, set, to }) => {
  const form = useForm();
  useEffect(
    () => {
      form.change(set, to);
    },
    [form, set, value, to],
  );
  return null;
};

export default WhenValueChanges;
