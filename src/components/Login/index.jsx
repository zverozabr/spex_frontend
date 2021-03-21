import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { actions as authActions, selectors as authSelectors } from '@/redux/api/users/auth';

import Button from '+components/Button';
import Form, { Field, FormRenderer, Controls, Validators } from '+components/Form';

import Container from './components/Container';

const Auth = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(authSelectors.isAuthenticated);

  const onLogin = useCallback(
    (values) => {
      dispatch(authActions.login(values));
    },
    [dispatch],
  );

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Container>
      <Form
        onSubmit={onLogin}
        render={({ handleSubmit, submitting }) => (
          <FormRenderer onSubmit={handleSubmit} noValidate>
            <Field
              name="login"
              label="Login"
              component={Controls.Input}
              type="email"
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

            <Controls.Label
              label="Remember Me"
              control={
                <Field
                  name="remember_me"
                  component={Controls.Checkbox}
                  type="checkbox"
                />
              }
            />

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={submitting}
            >
              Sign In
            </Button>
          </FormRenderer>
        )}
      />
    </Container>
  );
};

export default Auth;
