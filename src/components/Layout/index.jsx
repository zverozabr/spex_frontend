import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import AnalysisPage from '@/components/AnalysisPage';
import PathNames from '@/models/PathNames';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/api/omero';

import Progress from '+components/Progress';

import Body from './components/Body';

const Layout = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const datasets = useSelector(omeroSelectors.getDatasets);

  const datasetId = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      return pathArray[1] === PathNames.dataset && pathArray[2] ? pathArray[2] : undefined;
    },
    [location.pathname],
  );

  const onChange = useCallback(
    ({ target: { value } }) => {
      history.push(`/${PathNames.dataset}/${value}`);
    },
    [history],
  );

  useEffect(
    () => {
      if (datasets.length) {
        return;
      }
      dispatch(omeroActions.fetchDatasets());
    },
    [dispatch, datasets.length],
  );

  return (
    <Fragment>
      <Progress />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Genentech
          </Typography>
          <div style={{ marginLeft: '10px' }}>
            <label>
              <select value={datasetId} onChange={onChange}>
                <option value=''>Select dataset</option>
                {datasets?.map((item) => (
                  <option key={item['@id']} value={item['@id']}>
                    {item.Name}
                  </option>
                ))}
              </select>
            </label>
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
