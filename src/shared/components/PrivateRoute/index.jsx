import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { selectors as authSelectors } from '@/redux/api/users/auth';

const PrivateRoute = (props) => {
  const { component: Component, ...rest } = props;
  const isAuthenticated = useSelector(authSelectors.isAuthenticated);
  return (
    <Route
      {...rest}
      render={(props) => isAuthenticated ? (
        <Component {...props} />
        ) : (
          <Redirect to={{
              pathname: '/login',
              // eslint-disable-next-line react/prop-types
              state: { from: props.location },
          }}
          />
      )}
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
};

export default PrivateRoute;
