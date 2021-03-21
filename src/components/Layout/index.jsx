import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/api/omero';
import { actions as authActions } from '@/redux/api/users/auth';

import Button from '+components/Button';
import Progress from '+components/Progress';
import Select, { Option } from '+components/Select';
import Typography from '+components/Typography';

import Body from './components/Body';

const none = 'none';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const { projectId, datasetId } = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      const projectId = pathArray[1] === PathNames.project && pathArray[2] ? pathArray[2] : none;
      const datasetId = pathArray[3] === PathNames.dataset && pathArray[4] ? pathArray[4] : none;
      return { projectId, datasetId };
    },
    [location.pathname],
  );

  const projects = useSelector(omeroSelectors.getProjects);
  const projectDatasets = useSelector((state) => omeroSelectors.getDatasets(projectId)(state));

  const onProjectChange = useCallback(
    ({ target: { value } }) => {
      const fixedId = value === none ? '' : `/${value}`;
      const url = `/${PathNames.project}${fixedId}`;
      history.push(url);
    },
    [history],
  );

  const onDatasetChange = useCallback(
    ({ target: { value } }) => {
      const fixedId = value === none ? '' : `/${value}`;
      const url = `/${PathNames.project}/${projectId}/${PathNames.dataset}${fixedId}`;
      history.push(url);
    },
    [history, projectId],
  );

  const onLogout = useCallback(
    () => {
      dispatch(authActions.logout());
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (projects.length) {
        return;
      }
      dispatch(omeroActions.fetchProjects());
    },
    [dispatch, projects.length],
  );

  useEffect(
    () => {
      if (projectId && projectId === none) {
        return;
      }
      dispatch(omeroActions.fetchDatasets(projectId));
    },
    [dispatch, projectId],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearDatasets(projectId));
    },
    [projectId, dispatch],
  );

  return (
    <Fragment>
      <Progress />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Genentech
          </Typography>

          <div style={{ width: '300px', marginLeft: '10px' }}>
            <Select
              defaultValue={none}
              value={projectId}
              onChange={onProjectChange}
            >
              <Option value={none}>Select project</Option>
              {projects?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ width: '300px', marginLeft: '10px' }}>
            <Select
              defaultValue={none}
              value={datasetId}
              onChange={onDatasetChange}
              disabled={projectId && projectId === none}
            >
              <Option value={none}>Select dataset</Option>
              {projectDatasets?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>

          <Button
            style={{ marginLeft: 'auto' }}
            variant="outlined"
            onClick={onLogout}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Body>
        {children}
      </Body>
    </Fragment>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
};

Layout.defaultProps = {
  children: null,
};

export default Layout;
