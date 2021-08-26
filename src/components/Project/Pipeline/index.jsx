import React, { useState, useCallback, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import dagre from 'dagre';
import cloneDeep from 'lodash/cloneDeep';
import ReactFlow, { ReactFlowProvider, Controls, Background, isNode } from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import Blocks from '@/models/Blocks';
import PathNames from '@/models/PathNames';
import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import NoData from '+components/NoData';

import JobBlock from './blocks/JobBlock';
import StartBlock from './blocks/StartBlock';
import BlockFormWrapper from './components/BlockFormWrapper';
import BlocksModal from './components/BlocksModal';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import OutputWrapper from './components/OutputWrapper';
import SegmentationForm from './forms/SegmentationForm';

const jobRefreshInterval = 6e4; // 1 minute

const flowDirection = 'TB';
const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  start: StartBlock,
  job: JobBlock,
};

const defaultJobs = {
  segmentation: {
    name: 'segmentation',
    omeroIds: [],
    single: true,
    slices: false,
    content: {},
  },
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
        ...(Blocks[job.name] || {}),
        ...options.data,
        id: job.id,
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

  // TODO: Remove me after debug
  console.log({ pipeline });

  const [refresher, setRefresher] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [actionWithBlock, setActionWithBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

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

      const omeroIds = values.omeroIds.map((el) => el.id || el);

      const { content } = values;
      if (!content.segment) {
        delete values.content.segment;
        delete values.content.start;
        delete values.content.stop;
      }

      if (!values.slices) {
        delete values.content.slice;
      }

      delete values.single;
      delete values.slices;
      if (values.id === 'new') {
        delete values.id;
      }

      const normalizedJob = {
        ...values,
        omeroIds,
      };

      if (normalizedJob.id) {
        dispatch(pipelineActions.updateJob(normalizedJob));
      } else {
        dispatch(pipelineActions.createJob(normalizedJob));
      }
    },
    [dispatch],
  );

  const onPaneClick = useCallback(
    () => {
      setActionWithBlock(null);
      setSelectedBlock(null);
    },
    [],
  );

  const onBlockClick = useCallback(
    (_, blocks) => {
      if (blocks.id === 'new') {
        return;
      }
      setSelectedBlock({
        projectId,
        pipelineId,
        ...(jobs[blocks.id] || blocks),
      });
    },
    [jobs, pipelineId, projectId],
  );

  const onBlockAdd = useCallback(
    (type) => {
      setActionWithBlock(null);
      setSelectedBlock((prevValue) => ({
        projectId,
        pipelineId,
        rootId: prevValue?.id,
        id: 'new',
        ...(defaultJobs[type] || {}),
      }));
    },
    [pipelineId, projectId],
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

          <BlockFormWrapper>
            {!selectedBlock?.name && (
              <NoData>
                Select block
              </NoData>
            )}
            {selectedBlock?.name === 'segmentation' && (
              <SegmentationForm
                header={selectedBlock.name}
                initialValues={selectedBlock}
                onClose={onJobCancel}
                onSubmit={onJobSubmit}
              />
            )}
          </BlockFormWrapper>
        </FlowWrapper>

        <OutputWrapper>
          Output
        </OutputWrapper>

        {actionWithBlock === 'add' && selectedBlock && (
          <BlocksModal
            header="Add Block"
            onClose={() => setActionWithBlock(null)}
            onBlockClick={onBlockAdd}
            open
          />
        )}

        {actionWithBlock === 'delete' && selectedBlock && (
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
