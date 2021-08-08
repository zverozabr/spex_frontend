import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, { ReactFlowProvider, Controls, Background, isNode } from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import Blocks from '@/models/Blocks';
import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

// import BlocksWrapper from './components/BlocksWrapper';
// import Blocks from './components/Bloсks';
import Block from './components/Block';
import BlocksModal from './components/BlocksModal';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import OutputWrapper from './components/OutputWrapper';

const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  input: Block,
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
  const reactFlowWrapper = useRef(null);
  const [dagreGraph] = useState(new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})));
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [rootBlockId, setRootBlockId] = useState(false);

  const onBlockAdd = useCallback(
    (type) => {
      switch (type) {
        case Blocks.box.value:
          dispatch(pipelineActions.createBox({
            projectId,
            pipelineId,
            rootId: rootBlockId,
          }));
          break;
        default:
          console.log(`Add ${type} block in progress...`);
          break;
      }
      setRootBlockId(null);
    },
    [rootBlockId, dispatch, pipelineId, projectId],
  );

  const onBlockDelete = useCallback(
    (id, type) => {
      switch (type) {
        case Blocks.box.value:
          dispatch(pipelineActions.deleteBox({
            projectId,
            pipelineId,
            boxId: id,
          }));
          return;
        default:
          console.log(`Remove ${type} block with id ${id} in progress...`);
          return;
      }
    },
    [dispatch, pipelineId, projectId],
  );

  const recursion = useCallback(
    (data, elements, position) => {
      if (!data['boxes']) {
        return elements;
      }

      data['boxes'].forEach((element) => {
        elements.push({
          id: element.id,
          type: 'input',
          data: {
            ...Blocks.box,
            onAdd: setRootBlockId,
            onDelete: onBlockDelete,
          },
          position,
        });

        elements.push({ id: 'el/' + element.id, source: data['id'], target: element.id, isHidden: false, type: 'smoothstep' });

        elements = recursion(element, elements, position);

        if (element['tasks'] !== undefined) {
          element['tasks'].forEach((task) => {
            elements.push({ id: task.id, type: 'input', data: { label: 'task/' + task.id }, position, style: { border: '2px solid #777' } });
            elements.push({ id: 'el/' + task.id, source: element.id, target: task.id, animated: true });
          });
        }

        if (element['resources'] !== undefined) {
          element['resources'].forEach((res) => {
            elements.push({ id: res.id, type: 'input', data: { label: 'resources/' + res.id }, position });
            elements.push({ id: 'el/' + res.id, source: element.id, target: res.id, animated: true });
          });
        }
      });

      return elements;
    },
    [onBlockDelete],
  );

  const getLayoutedElements = useCallback(
    (elements, direction = 'LR') => {
      const isHorizontal = direction === 'LR';
      dagreGraph.setGraph({ rankdir: direction });

      elements.forEach((el) => {
        if (isNode(el)) {
          dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
          return;
        }

        dagreGraph.setEdge(el.source, el.target);
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

  const onLoad = useCallback(
    (_reactFlowInstance) => {
      setReactFlowInstance(_reactFlowInstance);
    },
    [setReactFlowInstance],
  );

  const elements = useMemo(
    () => {
      let result = [];
      if (!pipeline) {
        return result;
      }

      const position = { x: 0, y: 0 };

      result.push({
        id: pipeline.id,
        type: 'input',
        data: {
          value: 'pipeline',
          onAdd: setRootBlockId,
        },
        position,
      });

      result = recursion(pipeline, result, position);

      result = getLayoutedElements(result);

      return result;
    },
    [pipeline, recursion, getLayoutedElements],
  );

  const onSelectionChange = useCallback(
    (values) => {
      console.log(values);
    },
    [],
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
        <FlowWrapper ref={reactFlowWrapper}>
          <ReactFlow
            nodeTypes={nodeTypes}
            elements={elements}
            onLoad={onLoad}
            onSelectionChange={onSelectionChange}
            snapToGrid
            elementsSelectable
          >
            <Controls showInteractive={false} />
            <Background />
          </ReactFlow>
        </FlowWrapper>

        <OutputWrapper>
          Output
        </OutputWrapper>

        {rootBlockId && (
          <BlocksModal
            header="Add Block"
            onClose={() => setRootBlockId(null)}
            onBlockClick={onBlockAdd}
            open
          />
        )}
      </Container>
    </ReactFlowProvider>
  );
};

export default Pipeline;
