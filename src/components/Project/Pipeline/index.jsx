import React, { useState, useCallback, useMemo, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import classNames from 'classnames';
import dagre from 'dagre';
import cloneDeep from 'lodash/cloneDeep';
import ReactFlow, { ReactFlowProvider, Controls, Background, isNode } from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';
import { actions as tasksActions, selectors as tasksSelectors } from '@/redux/modules/tasks';

import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import NoData from '+components/NoData';

import JobBlock from './blocks/JobBlock';
import StartBlock from './blocks/StartBlock';
import AddBlockForm from './components/AddBlockForm';
import BlockSettingsForm from './components/BlockSettingsForm';
import BlockSettingsFormWrapper from './components/BlockSettingsFormWrapper';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import OutputWrapper from './components/OutputWrapper';

const jobRefreshInterval = 6e4; // 1 minute

const flowDirection = 'TB';
const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  start: StartBlock,
  job: JobBlock,
};

const addNewVirtualJobToPipeline = (rootId, newJob, node) => {
  if (node.id === rootId) {
    node.jobs.push(newJob);
  } else {
    for (let i = 0; i < node.jobs.length; i++) {
      // eslint-disable-next-line no-unused-vars
      addNewVirtualJobToPipeline(rootId, newJob, node.jobs[i]);
    }
  }
};

const createElements = (inputData, result, options = {}, selectedBlock) => {
  const { jobs } = inputData;

  if (!jobs) {
    return result;
  }

  jobs.forEach((job) => {
    result.push({
      id: job.id,
      type: 'job',
      position: options.position,
      className: classNames({
        new: job.id === 'new',
        selected: job.id === selectedBlock?.id,
      }),
      data: {
        ...job,
        ...options.data,
      },
    });

    result.push({
      id: `${inputData.id}-${job.id}`,
      type: 'smoothstep',
      source: inputData.id,
      target: job.id,
      animated: job.status !== 1,
    });

    result = createElements(job, result, options, selectedBlock);
  });

  return result;
};

const createGraphLayout = (elements, direction = 'LR') => {
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({ rankdir: direction });
  graph.setDefaultEdgeLabel(() => ({}));

  elements.forEach((el) => {
    if (isNode(el)) {
      graph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      graph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(graph);

  const isHorizontal = direction === 'LR';

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = graph.node(el.id);
      el.targetPosition = isHorizontal ? 'left' : 'top';
      el.sourcePosition = isHorizontal ? 'right' : 'bottom';
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }
    return el;
  });
};

const Pipeline = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;

  const matchPipelinePath = matchPath(location.pathname, { path: `/${PathNames.projects}/${projectId}/${PathNames.pipelines}/:id` });
  const pipelineId = matchPipelinePath ? matchPipelinePath.params.id : undefined;

  const pipeline = useSelector(pipelineSelectors.getPipeline(projectId, pipelineId));
  const jobs = useSelector(jobsSelectors.getJobs);
  const tasks = useSelector(tasksSelectors.getTasks);
  const jobTypes = useSelector(jobsSelectors.getJobTypes);

  const [refresher, setRefresher] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [actionWithBlock, setActionWithBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [toSelectKeys, setToSelectKeys] = useState([]);

  const elements = useMemo(
    () => {
      let _elements = [];

      if (!pipeline) {
        return _elements;
      }

      const options = {
        position: { x: 0, y: 0 },
        data: {
          direction: flowDirection,
          onAdd: () => setActionWithBlock('add'),
          onDelete: () => setActionWithBlock('delete'),
        },
      };

      _elements.push({
        id: pipeline.id,
        type: 'start',
        position: options.position,
        className: classNames({ selected: pipeline.id === selectedBlock?.id }),
        data: {
          ...options.data,
          id: pipeline.id,
          value: 'pipeline',
        },
      });

      const pipelineClone = cloneDeep(pipeline);

      if (selectedBlock && selectedBlock.rootId && selectedBlock.id === 'new') {
        addNewVirtualJobToPipeline(selectedBlock.rootId, selectedBlock, pipelineClone);
      }

      _elements = createElements(pipelineClone, _elements, options, selectedBlock);
      return createGraphLayout(_elements, flowDirection);
    },
    [pipeline, selectedBlock],
  );

  const onJobCancel = useCallback(
    () => {
      setActionWithBlock(null);
      setSelectedBlock(null);
    },
    [],
  );

  const onJobSubmit = useCallback(
    (values) => {
      setActionWithBlock(null);
      setSelectedBlock(null);

      const normalizedValues = {
        ...values,
        omeroIds: values.params?.omeroIds || jobs[values.rootId]?.omeroIds,
      };

      if (normalizedValues.id === 'new') {
        delete normalizedValues.id;
      }

      if (normalizedValues.id) {
        dispatch(pipelineActions.updateJob(normalizedValues));
        return;
      }

      const [rootId] = normalizedValues.params?.job || [];
      if (rootId != null) {
        dispatch(pipelineActions.createConn(normalizedValues));
        normalizedValues.rootId = rootId;
      }

      dispatch(pipelineActions.createJob(normalizedValues));
    },
    [dispatch, jobs],
  );

  const onJobRestart = useCallback(
    (_) => {
      const job = {
        id: jobs[selectedBlock.id].id,
        status: 0,
        tasks: jobs[selectedBlock.id].tasks,
      };


      if (job.id) {
        job.tasks.forEach((el) => {
          const task = {
            id: el.id, status: 0, result: '',
          };

          dispatch(tasksActions.updateTask(task));
        });
        delete job.tasks;
        dispatch(jobsActions.updateJob(job));
      }
    },
    [dispatch, jobs, selectedBlock],
  );

  const onPaneClick = useCallback(
    () => {
      setActionWithBlock(null);
      setSelectedBlock(null);
    },
    [],
  );

  const onBlockClick = useCallback(
    (_, block) => {
      if (block.id === 'new') {
        return;
      }

      const job = jobs[block.id];
      if (!job) {
        setSelectedBlock({
          projectId,
          pipelineId,
          ...block,
        });
        return;
      }

      const { params } = job.tasks[0];
      const jobTypeBlocks = (jobTypes[params.script]?.stages || [])
        .reduce((acc, stage) => [
          ...acc,
          ...stage.scripts,
        ], []);

      const { description, params_meta } = jobTypeBlocks.find((el) => el.script_path === params.part) || {};
      setSelectedBlock({
        projectId,
        pipelineId,
        id: job.id,
        name: job.name,
        status: job.status,
        omeroIds: job.omeroIds,
        description,
        folder: params.folder,
        script: params.script,
        script_path: params.part,
        params,
        params_meta,
      });

      let keys = [];
      job.tasks.forEach((el) => {
        if (tasks[el.id] && tasks[el.id].keys && tasks[el.id].keys.length > 0) {
          keys = [...keys, ...tasks[el.id].keys];
        }
      });
      setToSelectKeys(keys);
    },
    [jobTypes, jobs, pipelineId, projectId, setToSelectKeys, tasks],
  );

  const onJobReload = useCallback(
    (_) => {
      if (selectedBlock.id === 'new') {
        return;
      }

      if (selectedBlock.id) {
        dispatch(jobsActions.fetchJob(selectedBlock.id));
        onBlockClick(_, selectedBlock);
      }
    },
    [dispatch, selectedBlock, onBlockClick],
  );

  const onBlockAdd = useCallback(
    (block) => {
      setActionWithBlock(null);
      setSelectedBlock((prevValue) => ({
        projectId,
        pipelineId,
        rootId: prevValue?.id,
        id: 'new',
        status: 0,
        omeroIds: jobs[prevValue?.id]?.omeroIds,
        ...block,
      }));
    },
    [jobs, pipelineId, projectId],
  );

  const onBlockDelete = useCallback(
    () => {
      dispatch(pipelineActions.deleteJob({
        projectId,
        pipelineId,
        jobId: selectedBlock.id,
      }));

      setActionWithBlock(null);
      setSelectedBlock(null);
    },
    [dispatch, pipelineId, projectId, selectedBlock],
  );

  const onLoad = useCallback(
    (instance) => {
      setReactFlowInstance(instance);
    },
    [setReactFlowInstance],
  );

  const onLoadTaskKeys = useCallback(
    (_) => {
      if (!selectedBlock || !jobs || !jobs[selectedBlock.id].tasks || !tasks) {
        return;
      }
      let keys = [];
      const job = jobs[selectedBlock.id];

      job.tasks.forEach((el) => {
        dispatch(tasksActions.fetchTaskKeys(el.id));
        if (tasks[el.id]) {
          if (!tasks[el.id].keys || tasks[el.id].keys.length === 0) {
            keys = [];
          } else {
            keys = [...keys, ...tasks[el.id].keys];
          }
        }
      });
      setToSelectKeys(keys);
    },
    [selectedBlock, dispatch, jobs, setToSelectKeys, tasks],
  );

  useEffect(
    () => {
      if (!selectedBlock || !tasks || !selectedBlock.data || !selectedBlock.data.tasks) {
        return;
      }

      let keys = [];

      selectedBlock.data.tasks.forEach((el) => {
        if (tasks[el.id] && tasks[el.id].keys && tasks[el.id].keys.length > 0) {
          keys = [...keys, ...tasks[el.id].keys];
        }
      });
      setToSelectKeys(keys);
    },
    [selectedBlock, jobs, tasks, setToSelectKeys],
  );

  useEffect(
    () => {
      if (pipeline || !projectId || !pipelineId) {
        return;
      }
      dispatch(pipelineActions.fetchPipeline({ projectId, pipelineId }));
    },
    [dispatch, pipeline, projectId, pipelineId],
  );

  useEffect(
    () => {
      if (!selectedBlock || !jobs || !jobs[selectedBlock.id]) {
        return;
      }
      if (selectedBlock.status !== jobs[selectedBlock.id].status) {
        selectedBlock.status = jobs[selectedBlock.id].status;
        const job = jobs[selectedBlock.id];
        if (!job) {
          setSelectedBlock({
            projectId,
            pipelineId,
            ...selectedBlock,
          });
          return;
        }

        const { params } = job.tasks[0];
        const jobTypeBlocks = (jobTypes[params.script]?.stages || [])
          .reduce((acc, stage) => [
            ...acc,
            ...stage.scripts,
          ], []);

        const { description, params_meta } = jobTypeBlocks.find((el) => el.script_path === params.part) || {};
        setSelectedBlock({
          projectId,
          pipelineId,
          id: job.id,
          name: job.name,
          status: job.status,
          omeroIds: job.omeroIds,
          description,
          folder: params.folder,
          script: params.script,
          script_path: params.part,
          params,
          params_meta,
        });
      }
    },
    [selectedBlock, jobs, projectId, pipelineId, jobTypes],
  );

  useEffect(
    () => {
      dispatch(jobsActions.fetchJobs());
      return () => {
        dispatch(jobsActions.clearJobs());
      };
    },
    [dispatch, refresher],
  );

  useEffect(
    () => {
      const jobIntervalId = setInterval(() => {
        setRefresher(Date.now());
      }, jobRefreshInterval);

      return () => {
        if (jobIntervalId) {
          clearInterval(jobIntervalId);
        }
      };
    },
    [],
  );

  useEffect(
    () => {
      if (!(elements && reactFlowInstance)) {
        return;
      }

      const reactFlowTimeoutId = setTimeout(() => {
        reactFlowInstance.fitView();
      }, 100);

      return () => {
        if (reactFlowTimeoutId) {
          clearTimeout(reactFlowTimeoutId);
        }
      };
    },
    [elements, reactFlowInstance],
  );

  useEffect(
    () => {
      dispatch(jobsActions.fetchJobTypes());
      dispatch(tasksActions.fetchTasks());
      return () => {
        dispatch(jobsActions.clearJobTypes());
        dispatch(tasksActions.clearTasks());
      };
    },
    [dispatch],
  );

  return (
    <ReactFlowProvider>
      <Container>
        <FlowWrapper>
          <ReactFlow
            nodeTypes={nodeTypes}
            elements={elements}
            onElementClick={onBlockClick}
            onPaneClick={onPaneClick}
            onLoad={onLoad}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            snapToGrid
          >
            <Controls showInteractive={false} />
            <Background />
          </ReactFlow>

          <BlockSettingsFormWrapper>
            {selectedBlock?.id ? (
              <BlockSettingsForm
                block={selectedBlock}
                onClose={onJobCancel}
                onSubmit={onJobSubmit}
                onRestart={onJobRestart}
                onReload={onJobReload}
                onLoadKeys={onLoadTaskKeys}
              />
            ) : (
              <NoData>Select block</NoData>
            )}
          </BlockSettingsFormWrapper>
        </FlowWrapper>

        <OutputWrapper>
          <List dense component="div" role="list">
            {toSelectKeys.map((el) => {
              const id = `result-list-keys-${el}-label`;
              return (
                <ListItem key={id} role="listitem" button>
                  <ListItemIcon />
                  {el && <ListItemText id={id} primary={el} />}
                </ListItem>
              );
            })}
            <ListItem />
          </List>
        </OutputWrapper>

        {actionWithBlock === 'add' && selectedBlock?.id && (
          <AddBlockForm
            header="Add Block"
            jobTypes={jobTypes}
            selectedBlock={selectedBlock}
            onClose={() => setActionWithBlock(null)}
            onSubmit={onBlockAdd}
            open
          />
        )}

        {actionWithBlock === 'delete' && selectedBlock?.id && (
          <ConfirmModal
            action={ConfirmActions.delete}
            item={selectedBlock.name}
            onClose={() => setActionWithBlock(null)}
            onSubmit={onBlockDelete}
            open
          />
        )}
      </Container>
    </ReactFlowProvider>
  );
};

export default Pipeline;
