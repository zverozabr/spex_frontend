import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import Login from '@/components/Login';
import PrivateRoute from '+components/PrivateRoute';
import PrivateRoutes from './PrivateRoutes';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/login" component={Login} />
        <PrivateRoute path="/" component={PrivateRoutes} />
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
