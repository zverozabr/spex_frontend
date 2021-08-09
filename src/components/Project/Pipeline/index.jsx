import React, { useState, useCallback, useMemo, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, { ReactFlowProvider, Controls, Background, isNode } from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import Blocks from '@/models/Blocks';
import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';

import BlocksModal from './components/BlocksModal';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import JobBlock from './components/JobBlock';
import OutputWrapper from './components/OutputWrapper';
import StartBlock from './components/StartBlock';

const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  input: StartBlock,
  default: JobBlock,
};

const createElements = (inputData, result, options = {}) => {
  const { boxes: jobs } = inputData;
  if (!jobs) {
    return result;
  }

  jobs.forEach((job) => {
    result.push({
      id: job.id,
      type: 'default',
      data: {
        ...Blocks.box,
        ...options.data,
        id: job.id,
      },
      position: options.position,
    });

    result.push({
      id: `${inputData.id}-${job.id}`,
      source: inputData.id,
      target: job.id,
      type: 'smoothstep',
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

const Pipeline = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;

  const matchPipelinePath = matchPath(location.pathname, { path: `/${PathNames.projects}/${projectId}/${PathNames.pipelines}/:id` });
  const pipelineId = matchPipelinePath ? matchPipelinePath.params.id : undefined;

  const pipeline = useSelector(pipelineSelectors.getPipeline(projectId, pipelineId));
  console.log(pipeline);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [actionWithBlock, setActionWithBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const elements = useMemo(
    () => {
      let result = [];
      if (!pipeline) {
        return result;
      }

      const options = {
        position: { x: 0, y: 0 },
        data: {
          onAdd: () => setActionWithBlock('add'),
          onDelete: () => setActionWithBlock('delete'),
        },
      };

      result.push({
        id: pipeline.id,
        type: 'input',
        data: {
          ...options.data,
          id: pipeline.id,
          value: 'pipeline',
        },
        position: options.position,
      });

      result = createElements(pipeline, result, options);

      return createGraphLayout(result);
    },
    [pipeline],
  );

  const onBlockSelect = useCallback(
    (blocks) => {
      console.log('onBlockSelect', blocks);
      setSelectedBlock(blocks?.[0]);
    },
    [],
  );

  const onBlockAdd = useCallback(
    (type) => {
      switch (type) {
        case Blocks.box.value:
          dispatch(pipelineActions.createBox({
            projectId,
            pipelineId,
            rootId: selectedBlock.id,
          }));
          break;
        default:
          console.log(`Add ${type} block in progress...`);
          break;
      }

      setActionWithBlock(null);
    },
    [dispatch, pipelineId, projectId, selectedBlock],
  );

  const onBlockDelete = useCallback(
    () => {
      dispatch(pipelineActions.deleteBox({
        projectId,
        pipelineId,
        boxId: selectedBlock.id,
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
            item={selectedBlock.data.label}
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
