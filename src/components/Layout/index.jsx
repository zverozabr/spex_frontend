import React, { Fragment } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AnalysisPage from '@/components/AnalysisPage';
import Progress from '+components/Progress';

import Body from './components/Body';

const Layout = () => (
  <Fragment>
    <Progress />
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Super Awesome Spatial Analysis App
        </Typography>
      </Toolbar>
    </AppBar>
    <Body>
      <AnalysisPage />
    </Body>
  </Fragment>
);

export default Layout;
