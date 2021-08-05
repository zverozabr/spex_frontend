import React, {
 Fragment, useRef, useState, useMemo, useCallback, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';
import { actions as resourcesActions, selectors as resourcesSelectors } from '@/redux/modules/resources';
import { actions as tasksActions, selectors as tasksSelectors } from '@/redux/modules/tasks';

import Button, { ButtonSizes, ButtonColors } from '+components/Button';
import ClickAwayListener from '+components/ClickAwayListener';
import Grow from '+components/Grow';
import MenuList, { MenuItem } from '+components/MenuList';
import Paper from '+components/Paper';
import Popper from '+components/Popper';
import Table, { ButtonsCell } from '+components/Table';

import ButtonsContainer from '../components/ButtonsContainer';

import ImageCell from './components/ImageCell';
import ManageImagesFormModal from './components/ManageImagesFormModal';
import ManageResourcesModal from './components/ManageResourcesModal';
import ManageTasksModal from './components/ManageTasksModal';
import RecourseCell from './components/RecourseCell';
import TaskCell from './components/TaskCell';

const Resources = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;

  const project = useSelector(projectsSelectors.getProject(projectId));

  const images = useSelector(omeroSelectors.getThumbnails(projectId));
  const tasks = useSelector(tasksSelectors.getTasks);
  const resources = useSelector(resourcesSelectors.getResources);

  const imageIds = useMemo(
    () => (project?.omeroIds || []),
    [project],
  );

  const taskIds = useMemo(
    () => (project?.taskIds || []),
    [project],
  );

  const resourceIds = useMemo(
    () => (project?.resource_ids || []),
    [project],
  );

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const [manageImagesModalOpen, setManageImagesModalOpen] = useState(false);
  const [manageTasksModalOpen, setManageTasksModalOpen] = useState(false);
  const [manageResourcesModalOpen, setManageResourcesModalOpen] = useState(false);

  const onDeleteProjectResource = useCallback(
    (resource) => {
      const newProject = { ...project };
      switch (resource.type) {
        case 'image':
          newProject.omeroIds = newProject.omeroIds.filter((id) => id !== resource.id);
          break;
        case 'task':
          newProject.taskIds = newProject.taskIds.filter((id) => id !== resource.id);
          break;
        case 'resource':
          newProject.resource_ids = newProject.resource_ids.filter((id) => id !== resource.id);
          break;
        default:
          break;
      }
      dispatch(projectsActions.updateProject(newProject));
    },
    [dispatch, project],
  );

  const columns = useMemo(
    () => ([{
      accessor: 'id',
      Header: 'id',
      minWidth: 40,
      maxWidth: 40,
    }, {
      accessor: 'type',
      Header: 'type',
      minWidth: 40,
      maxWidth: 40,
    }, {
      id: 'data',
      Header: 'data',
      Cell: ({ row: { original } }) => useMemo(
        () => {
          switch (original.type) {
            case 'image':
              return (<ImageCell {...original} />);
            case 'task':
              return (<TaskCell {...original} />);
            case 'resource':
              return (<RecourseCell {...original} />);
            default:
              return original.type;
          }
        },
        [original],
      ),
    }, {
      id: 'actions',
      Header: 'actions',
      minWidth: 40,
      maxWidth: 40,
      Cell: ({ row: { original } }) => useMemo(
        () => (
          <ButtonsCell>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
              onClick={() => onDeleteProjectResource(original)}
            >
              Delete
            </Button>
          </ButtonsCell>
        ),
        [original],
      ),
    }]),
    [onDeleteProjectResource],
  );

  const imageData = useMemo(
    () => (Object.keys(images || {}).map((id) =>({
      id,
      type: 'image',
      img: images[id],
    }))),
    [images],
  );

  const taskData = useMemo(
    () => (taskIds.map((id) => ({
      id,
      type: 'task',
      ...(tasks[id] || {}),
    }))),
    [tasks, taskIds],
  );

  const resourceData = useMemo(
    () => (resourceIds.map((id) => ({
      id,
      type: 'resource',
      ...(resources[id] || {}),
    }))),
    [resources, resourceIds],
  );

  const tableData = useMemo(
    () => ([...imageData, ...taskData, ...resourceData]),
    [imageData, taskData, resourceData],
  );

  const onToggle = useCallback(
    () => {
      setOpen((prevOpen) => !prevOpen);
    },
    [setOpen],
  );

  const onToggleClose = useCallback(
    (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    },
    [setOpen],
  );

  const onKeyDownInMenu = useCallback(
    (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        setOpen(false);
      }
    },
    [setOpen],
  );

  const onManageImagesModalOpen = useCallback(
    () => {
      setManageImagesModalOpen(true);
    },
    [],
  );

  const onManageImagesModalClose = useCallback(
    () => {
      setManageImagesModalOpen(false);
    },
    [],
  );

  const onManageImagesModalSubmit = useCallback(
    (values) => {
      setManageImagesModalOpen(false);
      const omeroIds = values.omeroIds.map((el) => el.id || el);
      const updateData = { ...values, omeroIds };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch],
  );

  const onManageTasksModalOpen = useCallback(
    () => { setManageTasksModalOpen(true); },
    [],
  );

  const onManageTasksClose = useCallback(
    () => { setManageTasksModalOpen(false); },
    [],
  );

  const onTasksChanged = useCallback(
    (project, values) => {
      setManageTasksModalOpen(false);
      const taskIds = values.map((el) => el.id || el);
      const updateData = { ...project, taskIds };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch],
  );

  const onManageResourcesModalOpen = useCallback(
    () => { setManageResourcesModalOpen(true); },
    [],
  );

  const onManageResourcesClose = useCallback(
    () => { setManageResourcesModalOpen(false); },
    [],
  );

  const onResourcesChanged = useCallback(
    (project, values) => {
      setManageResourcesModalOpen(false);
      const resource_ids = values.map((el) => el.id || el);
      const updateData = { ...project, resource_ids };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
      }

      prevOpen.current = open;
    },
    [open],
    );

  useEffect(
    () => {
      if (imageIds.length === 0) {
        dispatch(omeroActions.clearThumbnails(projectId));
      }

      if (imageIds.length > 0) {
        dispatch(omeroActions.fetchThumbnails({ groupId: projectId, imageIds: imageIds }));
      }

      return () => {
        dispatch(omeroActions.clearThumbnails(projectId));
      };
    },
    [dispatch, imageIds, projectId],
  );

  useEffect(
    () => {
      if (taskIds.length === 0) {
        return;
      }
      dispatch(tasksActions.fetchTasks());
    },
    [dispatch, taskIds],
  );

  useEffect(
    () => {
      if (resourceIds.length === 0) {
        return;
      }
      dispatch(resourcesActions.fetchResources());
    },
    [dispatch, resourceIds],
  );

  return (
    <Fragment>
      <ButtonsContainer>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={onToggle}
        >
          Manage
        </Button>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={onToggleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={onKeyDownInMenu}>
                    <MenuItem onClick={onManageImagesModalOpen}>Images</MenuItem>
                    <MenuItem onClick={onManageTasksModalOpen}>Tasks</MenuItem>
                    <MenuItem onClick={onManageResourcesModalOpen} disabled>Resources</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </ButtonsContainer>

      <Table
        columns={columns}
        data={tableData}
        pageSizeOptions={[10]}
      />

      {manageImagesModalOpen && (
        <ManageImagesFormModal
          header="Manage Images"
          initialValues={{ ...project, omeroIds: imageData }}
          onClose={onManageImagesModalClose}
          onSubmit={onManageImagesModalSubmit}
          open
        />
      )}

      {manageTasksModalOpen && (
        <ManageTasksModal
          header="Manage Tasks"
          project={project}
          onClose={onManageTasksClose}
          onSubmit={onTasksChanged}
          open
        />
      )}

      {manageResourcesModalOpen && (
        <ManageResourcesModal
          header="Manage Resources"
          project={project}
          onClose={onManageResourcesClose}
          onSubmit={onResourcesChanged}
          open
        />
      )}
    </Fragment>
  );
};

export default Resources;
