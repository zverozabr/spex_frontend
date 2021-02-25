import React, { Fragment, useCallback, useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AnalysisPage from '@/components/AnalysisPage';

import {
  actions as omeroActions,
  selectors as omeroSelectors,
} from '@/redux/api/omero';

import Progress from '+components/Progress';

import Body from './components/Body';

const Layout = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const datasets = useSelector(omeroSelectors.getDatasets);

  const onChange = useCallback(
    ({ target: { value } }) => {
      history.push(`?dataset=${value}`);
    },
    [history],
  );

  useEffect(
    () => {
      if (datasets) {
        return;
      }
      dispatch(omeroActions.fetchDatasets());
    },
    [dispatch, datasets],
  );

  return (
    <Fragment>
      <Progress />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Genentech
          </Typography>
          <div>
            <select onChange={onChange}>
              {datasets?.map((item) => (
                <option key={item['@id']} value={item['@id']}>
                  {item.Name}
                </option>
              ))}
            </select>
          </div>
        </Toolbar>
      </AppBar>
      <Body>
        <AnalysisPage />
      </Body>
    </Fragment>
  );
};

export default Layout;
