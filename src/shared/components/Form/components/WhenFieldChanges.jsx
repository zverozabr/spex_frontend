/* eslint-disable react/prop-types, react/react-in-jsx-scope */
import React from 'react';
import { Field } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';

// @see: https://github.com/final-form/react-final-form/issues/348
// and: https://erikras.com/blog/declarative-form-rules
const WhenFieldChanges = ({ field, becomes, set, to }) => (
  <Field name={set} subscription={{}}>
    {({ input: { onChange } }) => (
      <OnChange name={field}>
        {(value) => {
          if (value === becomes) {
            onChange(to);
          }
        }}
      </OnChange>
    )}
  </Field>
);

export default WhenFieldChanges;
