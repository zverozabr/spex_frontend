import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, { Controls, ReactFlowProvider, isNode } from 'react-flow-renderer';

import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';
import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';
import { actions as resourcesActions, selectors as resourcesSelectors } from '@/redux/modules/resources';
import { actions as tasksActions, selectors as tasksSelectors } from '@/redux/modules/tasks';

import Button, { ButtonColors, ButtonSizes } from '+components/Button';
import ClickAwayListener from '+components/ClickAwayListener';
import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import { Field, Controls as FormControls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
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

  const pipelines = useSelector(pipelineSelectors.getPipelines(projectId));
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
  const [activePipelineTab, setActivePipelineTab] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [dagreGraph] = useState(new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})));
  const [addPipelineModalOpen, setAddPipelineModalOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete ] = useState(null);

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

  const nodeWidth = 172;
  const nodeHeight = 36;

  const getLayoutedElements = useCallback((elements, direction = 'LR') => {
      const isHorizontal = direction === 'LR';
      dagreGraph.setGraph({ rankdir: direction });

      elements.forEach((el) => {
        if (isNode(el)) {
          dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
          dagreGraph.setEdge(el.source, el.target);
        }
      });

      dagre.layout(dagreGraph);

      return elements.map((el) => {
        if (isNode(el)) {
          const nodeWithPosition = dagreGraph.node(el.id);
          el.targetPosition = isHorizontal ? 'left' : 'top';
          el.sourcePosition = isHorizontal ? 'right' : 'bottom';

          // unfortunately we need this little hack to pass a slightly different position
          // to notify react flow about the change. Moreover we are shifting the dagre node position
          // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
          el.position = {
            x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
            y: nodeWithPosition.y - nodeHeight / 2,
          };
        }

        return el;
      });
    },
    [dagreGraph],
  );

  const recursion = useCallback(
    (data, elements, position) => {
      if (data['boxes'] !== undefined) {
        data['boxes'].forEach((element) => {
          elements.push({ id: element.id, type: 'input', data: { label: 'box/' + element.id }, position });
          elements.push({ id: 'el/' +element.id, source: data['id'], target: element.id, isHidden: false, type: 'smoothstep' });
          elements = recursion(element, elements, position);
          if (element['tasks'] !== undefined) {
            element['tasks'].forEach((task) => {
              elements.push({ id: task.id, type: 'input', data: { label: 'task/' + task.id }, position, style: { border: '2px solid #777' } });
              elements.push({ id: 'el/' +task.id, source: element.id, target: task.id, animated: true });
            });
          };
          if (element['resources'] !== undefined) {
            element['resources'].forEach((res) => {
              elements.push({ id: res.id, type: 'input', data: { label: 'resources/' + res.id }, position });
              elements.push({ id: 'el/' + res.id, source: element.id, target: res.id, animated: true });
            });
          };
        });
      };
      return elements;
    },
    [],
  );

  const resourceActions = [{ name: 'Remove selected', fn: (rows) => onToggleRemoveRid(rows), color: ButtonColors.danger }];
  const _tasksActions = [{ name: 'Remove selected', fn: (rows) => onToggleRemoveTid(rows), color: ButtonColors.danger }];

  const resourceColumns = useMemo(
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

  const tasksColumns = useMemo(
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

  const resourceData = useMemo(
    () => {
      if (resource_ids.length === 0 || resources.length === 0) {
        return [];
      };
      return Object.values(resources).filter((res) => resource_ids.indexOf(res.id) > -1);
    },
    [resources, resource_ids],
  );

  const pipelineData = useMemo(
    () => {
      if (Object.keys(pipelines || {}).length > 0 && activePipelineTab !== false && !pipelines instanceof Array) {
        let data = [];
        const p = activePipelineTab;
        const position = { x: 0, y: 0 };

        data.push({ id: pipelines[p].id, type: 'input', data: { label: pipelines[p]._id }, position, isHidden: true });
        data = recursion(pipelines[p], data, position);
        if (data.length === 1) return [];
        return getLayoutedElements(data);
      } else {
        return [];
      };
    },
    [pipelines, recursion, activePipelineTab, getLayoutedElements],
  );

  const pipelineTabs = useMemo(
    () => {
      if (Object.keys(pipelines || {}).length > 0) {
        return Object.values(pipelines).map((p) => {
          return <Tab label={p.name} key={p.id} value={p.id} />;
        });
      } else {
        return [];
      };
    },
    [pipelines],
  );

  const tasksData = useMemo(
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

  const onLoadReactFlow = useCallback(
    (rf) => {
      setReactFlowInstance(rf);
    },
    [setReactFlowInstance],
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

  const onAddPipelineModalOpen = useCallback(
    () => { setAddPipelineModalOpen(true); },
    [],
  );

  const onAddPipelineClose = useCallback(
    () => { setAddPipelineModalOpen(false); },
    [],
  );

  const onDeletePipelineModalOpen = useCallback(
    (pipeline) => {
        setPipelineToDelete(pipeline);
      },
    [],
  );

  const onDeletePipelineModalClose = useCallback(
    () => {
        setPipelineToDelete(null);
      },
    [],
  );

  const onDeletePipelineModalSubmit = useCallback(
    () => {
      dispatch(pipelineActions.deletePipeline([projectId, pipelineToDelete]));
      setPipelineToDelete(null);
    },
    [dispatch, pipelineToDelete, projectId],
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

  const onPipelinesChanged = useCallback(
    (values) => {
      setAddPipelineModalOpen(false);
      dispatch(pipelineActions.createPipeline({ ...values, 'project': projectId.toString() }));
    },
    [dispatch, projectId],
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

  const onPipelineTabChange = useCallback(
    (_, id) => {
      setActivePipelineTab(id);
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

  useEffect(() => {
    if (pipelineData && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView();
      }, 100);
      // reactFlowInstance.zoomTo(1.2);
    }
  }, [pipelineData, reactFlowInstance]);

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
      if (Object.keys(pipelines || {}).length > 0) {
        return;
      }
      if (pipelines instanceof Array) {
        return;
      }
      dispatch(pipelineActions.fetchPipelines(projectId));
    },
    [dispatch, pipelines, projectId],
  );

  useEffect(
    () => {
      if (Object.keys(pipelines || {}).length > 0 && activePipelineTab === false) {
        setActivePipelineTab(Object.keys(pipelines)[0]);
      }
    },
    [activePipelineTab, pipelines],
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
            columns={resourceColumns}
            data={resourceData}
            actions={resourceActions}
            allowRowSelection
            pageSizeOptions={[10]}
            minRows={10}
          />
        </TabPanel>
        <TabPanel value={activeDataTab} index={2}>
          <Table
            columns={tasksColumns}
            data={tasksData}
            actions={_tasksActions}
            allowRowSelection
            pageSizeOptions={[10]}
            minRows={10}
          />
        </TabPanel>
      </Row>

      <Row>
        <ButtonsContainer>
          <Button onClick={onAddPipelineModalOpen}>
            Add
          </Button>
          <Button
            size={ButtonSizes.small}
            color={ButtonColors.secondary}
            variant="outlined"
            onClick={() => onDeletePipelineModalOpen(activePipelineTab)}
          >
            Delete
          </Button>
          <Tabs value={activePipelineTab} onChange={onPipelineTabChange}>
            {pipelineTabs}
          </Tabs>
        </ButtonsContainer>
        <PipelineContainer>
          <ReactFlowProvider>
            <ReactFlow elements={pipelineData} onLoad={onLoadReactFlow}>
              {/* <MiniMap /> */}
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
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

      {addPipelineModalOpen && (
        <FormModal
          header="Add pipeline"
          project={project}
          onClose={onAddPipelineClose}
          onSubmit={onPipelinesChanged}
          open
        >
          <Field
            name="name"
            label="Name"
            component={FormControls.TextField}
            validate={Validators.required}
            required
          />
        </FormModal>
      )}

      {pipelineToDelete && (
        <ConfirmModal
          action={ConfirmActions.delete}
          item={activePipelineTab}
          onClose={onDeletePipelineModalClose}
          onSubmit={onDeletePipelineModalSubmit}
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
