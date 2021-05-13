import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';

import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';
import { actions as authActions } from '@/redux/modules/users/auth';

import Button, { ButtonColors } from '+components/Button';
import Link from '+components/Link';
import Progress from '+components/Progress';
import Select, { Option } from '+components/Select';
import Typography from '+components/Typography';

import Body from './components/Body';

const none = 'none';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const { projectId } = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      const projectId = pathArray[1] === PathNames.project && pathArray[2] ? pathArray[2] : none;
      return { projectId };
    },
    [location.pathname],
  );

  const projects = useSelector(projectsSelectors.getProjects);
  const isProjectsFetching = useSelector(projectsSelectors.isFetching);

  const onProjectChange = useCallback(
    ({ target: { value: id } }) => {
      if (id === none) {
        history.push('/');
        return;
      }
      const url = `/${PathNames.project}/${id}`;
      history.push(url);
    },
    [history],
  );

  const onLogout = useCallback(
    () => {
      dispatch(authActions.logout());
    },
    [dispatch],
  );

  const projectLength = Object.keys(projects).length;
  useEffect(
    () => {
      if (projectLength) {
        return;
      }
      dispatch(projectsActions.fetchProjects());
    },
    [dispatch, projectLength],
  );

  useEffect(
    () => () => {
      dispatch(projectsActions.clearProjects());
    },
    [dispatch],
  );

  return (
    <Fragment>
      <Progress />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6"><Link to="/">Genentech</Link></Typography>

          {projectLength > 0 && !isProjectsFetching && (
            <div style={{ width: '300px', marginLeft: '10px' }}>
              <Select
                defaultValue={none}
                value={projectId}
                onChange={onProjectChange}
                $color="white"
              >
                <Option value={none}>Select project</Option>
                {Object.values(projects).map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
              </Select>
            </div>
          )}

          <Button
            style={{ marginLeft: 'auto' }}
            variant="outlined"
            color={ButtonColors.secondary}
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
