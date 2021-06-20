import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import WorkIcon from '@material-ui/icons/Work';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, matchPath } from 'react-router-dom';

import PathNames from '@/models/PathNames';

import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';
import { actions as authActions } from '@/redux/modules/users/auth';

import Button, { ButtonColors } from '+components/Button';
import Link from '+components/Link';
import List, { ListItem, ListItemIcon, ListItemText } from '+components/List';
import Progress from '+components/Progress';
import Select, { Option } from '+components/Select';
import Typography from '+components/Typography';
import { getFromStorage, saveToStorage } from '+utils/localStorage';

const none = 'none';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth + 36,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    overflowX: 'hidden',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  projectSelect: {
    width: '300px !important',
    marginLeft: '20px',
  },
  logoutButton: {
    marginLeft: 'auto',
  },
  listItem: {
    paddingLeft: '24px',
  },
  listItemActive: {
    backgroundColor: theme.palette.background.sidebarItemActive,
  },
}));

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { pathname } = useLocation();

  const classes = useStyles();
  const theme = useTheme();
  const [sidebarOpened, setSidebarOpened] = useState(getFromStorage('sidebarOpened') === 'true');

  const projectId = useMemo(
    () => {
      const match = matchPath(pathname, { path: `/${PathNames.projects}/:id` });
      return match ? match.params.id : none;
    },
    [pathname],
  );

  const projects = useSelector(projectsSelectors.getProjects);
  const isProjectsFetching = useSelector(projectsSelectors.isFetching);

  const onProjectChange = useCallback(
    ({ target: { value: id } }) => {
      const url = `/${PathNames.projects}${id === none ? '' : `/${id}`}`;
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

  const onSidebarItemClick = useCallback(
    (url) => () => {
      history.push(url);
    },
    [history],
  );

  const onSidebarToggle = useCallback(
    () => {
      setSidebarOpened((prevValue) => {
        saveToStorage('sidebarOpened', !prevValue);
        return !prevValue;
      });
    },
    [],
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
    <div className={classes.root}>
      <CssBaseline />
      <Progress />

      <AppBar
        position="fixed"
        className={classNames(classes.appBar, {
          [classes.appBarShift]: sidebarOpened,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onSidebarToggle}
            edge="start"
            className={classNames(classes.menuButton, {
              [classes.hide]: sidebarOpened,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6"><Link to="/">Genentech</Link></Typography>

          {projectLength > 0 && !isProjectsFetching && (
            <Select
              className={classes.projectSelect}
              defaultValue={none}
              value={projectId}
              onChange={onProjectChange}
              $color="white"
            >
              <Option value={none}>Select project</Option>
              {Object.values(projects).map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
            </Select>
          )}

          <Button
            className={classes.logoutButton}
            variant="outlined"
            color={ButtonColors.secondary}
            onClick={onLogout}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        className={classNames(classes.drawer, {
          [classes.drawerOpen]: sidebarOpened,
          [classes.drawerClose]: !sidebarOpened,
        })}
        classes={{
          paper: classNames({
            [classes.drawerOpen]: sidebarOpened,
            [classes.drawerClose]: !sidebarOpened,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={onSidebarToggle}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem
            className={classes.listItem}
            selected={!!matchPath(pathname, { path: [`/${PathNames.projects}`, `/${PathNames.projects}/:id`] })}
            onClick={onSidebarItemClick(`/${PathNames.projects}`)}
            button
          >
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItem>

          <ListItem
            className={classes.listItem}
            selected={!!matchPath(pathname, { path: [`/${PathNames.jobs}`, `/${PathNames.jobs}/:id`] })}
            onClick={onSidebarItemClick(`/${PathNames.jobs}`)}
            button
          >
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Jobs" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
};

Layout.defaultProps = {
  children: null,
};

export default Layout;
