import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';
import { actions as resourcesActions, selectors as resourcesSelectors } from '@/redux/modules/resources';
import { actions as tasksActions, selectors as tasksSelectors } from '@/redux/modules/tasks';

import Button, { ButtonColors } from '+components/Button';
import ClickAwayListener from '+components/ClickAwayListener';
import Grow from '+components/Grow';
import MenuList, { MenuItem } from '+components/MenuList';
import NoData from '+components/NoData';
import Paper from '+components/Paper';
import Popper from '+components/Popper';
import Table from '+components/Table';
import Tabs, { Tab, TabPanel } from '+components/Tabs';
import ThumbnailsViewer from '+components/ThumbnailsViewer';

import ButtonsContainer from './components/ButtonsContainer';
import Container from './components/Container';
import ManageImagesFormModal from './components/ManageImagesFormModal';
import ManageJobsModal from './components/ManageJobsModal';
import ManageResourcesModal from './components/ManageResourcesModal';
import PipelineContainer from './components/PipelineContainer';
import Row from './components/Row';
import ThumbnailsContainer from './components/ThumbnailsContainer';


const not = (a, b) => (a.filter((value) => b.indexOf(value) === -1));

const Project = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const resources = useSelector(resourcesSelectors.getResources);
  const projectId = useMemo(
    () => {
      const match = matchPath(pathname, { path: `/${PathNames.projects}/:id` });
      return match ? match.params.id : undefined;
    },
    [pathname],
  );

  const project = useSelector(projectsSelectors.getProject(projectId));
  const thumbnails = useSelector(omeroSelectors.getThumbnails(projectId));
  const tasks = useSelector(tasksSelectors.getTasks);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [selectedThumbnails, setSelectedThumbnails] = useState([]);
  const [manageImagesModalOpen, setManageImagesModalOpen] = useState(false);
  const [manageJobsModalOpen, setManageJobsModalOpen] = useState(false);
  const [manageResourcesModalOpen, setManageResourcesModalOpen] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState(0);

  const omeroIds = useMemo(
    () => (project?.omeroIds || []),
  [project],
  );
  const resource_ids = useMemo(
    () => (project?.resource_ids || []),
  [project],
  );
  const taskIds = useMemo(
    () => (project?.taskIds || []),
  [project],
  );

  const r_actions = [{ name: 'Remove selected', fn: (rows) => onToggleRemoveRid(rows), color: ButtonColors.danger }];
  const t_actions = [{ name: 'Remove selected', fn: (rows) => onToggleRemoveTid(rows), color: ButtonColors.danger }];

  const r_columns = useMemo(
    () => ([
      {
        id: 'name',
        accessor: 'name',
        Header: 'Name',
        Cell: ({ row: { original: { id, name } } }) => useMemo(
          () => (
            // <Link to={`/${PathNames.resources}/${id}`}>
            <div> {id} </div>
            // </Link>
          ),
          [id],
        ),
      }, {
        id: 'omeroIds',
        accessor: 'omeroIds',
        Header: 'Omero Image IDs',
      },
    ]),
    [],
  );
  const t_columns = useMemo(
    () => ([
      {
        id: 'id',
        accessor: 'id',
        Header: 'id',
      },
      {
        id: 'name',
        accessor: 'name',
        Header: 'name',
      },
      ]),
      [],
    );

  const res_data = useMemo(
    () => {
      if (resource_ids.length === 0 || resources.length === 0) {
        return [];
      };
      return Object.values(resources).filter((res) => resource_ids.indexOf(res.id) > -1);
    },
    [resources, resource_ids],
  );
  const t_data = useMemo(
    () => {
      if (taskIds.length === 0 || tasks.length === 0) {
        return [];
      };
      return Object.values(tasks).filter((task) => taskIds.indexOf(task.id) > -1);
    },
    [tasks, taskIds],
  );

  const normalizedThumbnails = useMemo(
    () => (Object.keys(thumbnails || {}).map((id) =>({ id, img: thumbnails[id] }))),
    [thumbnails],
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

  const onRemoveImages = useCallback(
    () => {
      const newProject = {
        ...project,
        omeroIds: not(omeroIds, selectedThumbnails.map(String)),
      };
      dispatch(projectsActions.updateProject(newProject));
      setSelectedThumbnails([]);
    },
    [dispatch, omeroIds, project, selectedThumbnails],
  );

  const onPipelineAdd = useCallback(
    () => {
      // eslint-disable-next-line no-console
      console.log('onPipelineAdd');
    },
    [],
  );

  const onThumbnailClick = useCallback(
    (ids) => {
      setSelectedThumbnails(ids);
    },
    [],
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

  const onManageJobsModalOpen = useCallback(
    () => { setManageJobsModalOpen(true); },
    [],
  );

  const onManageJobsClose = useCallback(
    () => { setManageJobsModalOpen(false); },
    [],
  );

  const onJobsChanged = useCallback(
    (project, values) => {
      setManageJobsModalOpen(false);
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

  const onToggleRemoveRid = useCallback(
    (rows) => {
      const to_delete = rows.map((el) => el.id || el);
      const new_data = resource_ids.filter((id) => to_delete.indexOf(id) === -1);
      const updateData = { ...project, resource_ids: new_data };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch, resource_ids, project],
  );

  const onToggleRemoveTid = useCallback(
    (rows) => {
      const to_delete = rows.map((el) => el.id || el);
      const new_data = taskIds.filter((id) => to_delete.indexOf(id) === -1);
      const updateData = { ...project, taskIds: new_data };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch, taskIds, project],
  );

  const onDataTabChange = useCallback(
    (_, id) => {
      setActiveDataTab(id);
    },
    [],
  );

  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(
    () => {
      if (resource_ids.length === 0) {
        return;
      }
      dispatch(resourcesActions.fetchResources({}));
    },
    [dispatch, resource_ids],
  );
  useEffect(
    () => {
      if (taskIds.length === 0) {
        return;
      }
      dispatch(tasksActions.fetchTasks({}));
    },
    [dispatch, taskIds],
  );

  useEffect(
    () => {
      if (omeroIds.length === 0) {
        dispatch(omeroActions.clearThumbnails(projectId));
      }

      if (omeroIds.length > 0) {
        dispatch(omeroActions.fetchThumbnails({ groupId: projectId, imageIds: omeroIds }));
      }

      return () => {
        dispatch(omeroActions.clearThumbnails(projectId));
      };
    },
    [dispatch, omeroIds, projectId],
  );

  return (
    <Container>
      <Row>
        <ButtonsContainer>
          <Button
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={onToggle}
          >
            Manage
          </Button>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={onToggleClose}>
                    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={onKeyDownInMenu}>
                      <MenuItem onClick={onManageImagesModalOpen}>Images</MenuItem>
                      <MenuItem onClick={onManageJobsModalOpen}>Jobs</MenuItem>
                      <MenuItem onClick={onManageResourcesModalOpen}>Resources</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </ButtonsContainer>
        <Tabs value={activeDataTab} onChange={onDataTabChange}>
          <Tab label="Images" />
          <Tab label="Resources" />
          <Tab label="Tasks" />
        </Tabs>
        <TabPanel value={activeDataTab} index={0}>
          <ButtonsContainer style={{ 'padding': '14px', 'background': '#ccc' }}>
            <Button
              color={ButtonColors.danger}
              onClick={onRemoveImages}
              disabled={selectedThumbnails.length === 0}
            >
              Remove Selected
            </Button>
          </ButtonsContainer>
          <ThumbnailsContainer>
            {normalizedThumbnails.length === 0 && <NoData>No Images To Display</NoData>}
            {normalizedThumbnails.length > 0 && (
              <ThumbnailsViewer
                thumbnails={normalizedThumbnails}
                active={selectedThumbnails}
                onClick={onThumbnailClick}
                allowMultiSelect
                $size={1.5}
                $center
              />
            )}
          </ThumbnailsContainer>
        </TabPanel>
        <TabPanel value={activeDataTab} index={1}>
          <Table
            columns={r_columns}
            data={res_data}
            actions={r_actions}
            allowRowSelection
            pageSizeOptions={[10]}
            minRows={10}
          />
        </TabPanel>
        <TabPanel value={activeDataTab} index={2}>
          <Table
            columns={t_columns}
            data={t_data}
            actions={t_actions}
            allowRowSelection
            pageSizeOptions={[10]}
            minRows={10}
          />
        </TabPanel>
      </Row>

      <Row>
        <ButtonsContainer>
          <Button onClick={onPipelineAdd}>
            Add Pipeline
          </Button>
        </ButtonsContainer>

        <PipelineContainer>
          Pipeline Will Be Here
        </PipelineContainer>
      </Row>

      {manageImagesModalOpen && (
        <ManageImagesFormModal
          header="Manage Images"
          initialValues={{ ...project, omeroIds: normalizedThumbnails }}
          onClose={onManageImagesModalClose}
          onSubmit={onManageImagesModalSubmit}
          open
        />
      )}

      {manageJobsModalOpen && (
        <ManageJobsModal
          header="Manage Jobs"
          project={project}
          onClose={onManageJobsClose}
          onSubmit={onJobsChanged}
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
    </Container>
  );
};

export default Project;
