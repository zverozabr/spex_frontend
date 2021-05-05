import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { actions as authActions, selectors as authSelectors } from '@/redux/modules/users/auth';

import Button, { ButtonColors } from '+components/Button';
import Form, { Field, FormRenderer, Controls, Validators } from '+components/Form';

import Alert from './components/Alert';
import Container from './components/Container';

const Auth = () => {
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    isFetching,
    error,
  } = useSelector(authSelectors.getState);

  const onLogin = useCallback(
    (values) => {
      dispatch(authActions.login(values));
    },
    [dispatch],
  );

  const render = useCallback(
    ({ handleSubmit, submitting, pristine }) => (
      <FormRenderer onSubmit={handleSubmit}>
        {!!error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <Field
          name="username"
          label="Username"
          component={Controls.Input}
          type="username"
          validate={Validators.required}
          required
        />

        <Field
          name="password"
          label="Password"
          component={Controls.Input}
          type="password"
          validate={Validators.required}
          required
        />

        <Button
          color={ButtonColors.primary}
          type="submit"
          disabled={pristine || isFetching || submitting}
        >
          Sign In
        </Button>
      </FormRenderer>
    ),
    [isFetching, error],
  );

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Container>
      <Form
        onSubmit={onLogin}
        render={render}
      />
    </Container>
  );
};

export default Auth;
