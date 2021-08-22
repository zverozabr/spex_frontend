import React, { useState, useCallback, useMemo, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, { ReactFlowProvider, Controls, Background, isNode } from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import Blocks from '@/models/Blocks';
import PathNames from '@/models/PathNames';
import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import NoData from '+components/NoData';

import BlockFormWrapper from './components/BlockFormWrapper';
import BlocksModal from './components/BlocksModal';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import OutputWrapper from './components/OutputWrapper';

import JobBlock from './JobBlock';
import SegmentationForm from './SegmentationForm';
import StartBlock from './StartBlock';

const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  input: StartBlock,
  default: JobBlock,
};

const createElements = (inputData, result, options = {}) => {
  const { jobs } = inputData;

  if (!jobs) {
    return result;
  }

  jobs.forEach((job) => {
    result.push({
      id: job.id,
      type: 'default',
      position: options.position,
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
    });

    result = createElements(job, result, options);
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

const defaultJobs = {
  segmentation: {
    name: 'segmentation',
    omeroIds: [],
    single: true,
    slices: false,
    content: {},
  },
};

const refreshInterval = 6e4; // 1 minute

const direction = 'LR';

const Pipeline = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;

  const matchPipelinePath = matchPath(location.pathname, { path: `/${PathNames.projects}/${projectId}/${PathNames.pipelines}/:id` });
  const pipelineId = matchPipelinePath ? matchPipelinePath.params.id : undefined;

  const pipeline = useSelector(pipelineSelectors.getPipeline(projectId, pipelineId));
  const jobs = useSelector(jobsSelectors.getJobs);
  console.log(pipeline);
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
          direction,
          onAdd: () => setActionWithBlock('add'),
          onDelete: () => setActionWithBlock('delete'),
        },
      };

      _elements.push({
        id: pipeline.id,
        type: 'input',
        position: options.position,
        data: {
          ...options.data,
          id: pipeline.id,
          value: 'pipeline',
        },
      });

      _elements = createElements(pipeline, _elements, options);

      return createGraphLayout(_elements, direction);
    },
    [pipeline],
  );

  const onJobSubmit = useCallback(
    (values) => {
      setSelectedBlock(values);

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

      const normalizedJob = {
        ...values,
        omeroIds,
        content: JSON.stringify(content),
      };

      if (normalizedJob.id) {
        dispatch(jobsActions.updateJob(normalizedJob));
      } else {
        dispatch(pipelineActions.createJob(normalizedJob));
      }
    },
    [dispatch],
  );

  const onBlockSelect = useCallback(
    (blocks) => {
      if (!blocks || !blocks[0]) {
        return;
      }
      const { id } = blocks[0];
      setSelectedBlock({
        projectId,
        pipelineId,
        ...(jobs[id] || blocks[0]),
      });
    },
    [jobs, pipelineId, projectId],
  );

  const onBlockAdd = useCallback(
    (type) => {
      setSelectedBlock({
        projectId,
        pipelineId,
        rootId: selectedBlock?.id,
        ...(defaultJobs[type] || {}),
      });

      setActionWithBlock(null);
    },
    [pipelineId, projectId, selectedBlock?.id],
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
      const intervalId = setInterval(() => {
        setRefresher(Date.now());
      }, refreshInterval);
      return () => {
        clearInterval(intervalId);
      };
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!(elements && reactFlowInstance)) {
        return;
      }

      const timer = setTimeout(() => {
        reactFlowInstance.fitView();
      }, 100);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    },
    [elements, reactFlowInstance],
  );
  console.log(selectedBlock);
  return (
    <ReactFlowProvider>
      <Container>
        <FlowWrapper>
          <ReactFlow
            nodeTypes={nodeTypes}
            elements={elements}
            onSelectionChange={onBlockSelect}
            onLoad={onLoad}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
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
