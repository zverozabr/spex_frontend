import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, {
  ReactFlowProvider, addEdge, removeElements, Controls, Background, isNode,
} from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';

import Blocks from '@/models/Blocks';
import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import Button, { ButtonColors } from '+components/Button';
// import BlocksWrapper from './components/BlocksWrapper';
// import Blocks from './components/Bloсks';
import Block from './components/Block';
import BlocksModal from './components/BlocksModal';
import Container from './components/Container';
import FlowWrapper from './components/FlowWrapper';
import OutputWrapper from './components/OutputWrapper';

const nodeWidth = 172;
const nodeHeight = 36;

let id = 0;
const getId = () => `dndnode_${id++}`;

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

  const pipelines = useSelector(pipelineSelectors.getPipelines(projectId));

  const pipeline = useMemo(
    () => (pipelines?.[pipelineId]),
    [pipelines, pipelineId],
  );

  const [showBlocksModal, toggleBlocksModal] = useToggle(false);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dagreGraph] = useState(new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})));

  const onBlockAdd = useCallback(
    (type) => {
      toggleBlocksModal();
      switch (type) {
        case Blocks.box.value:
          dispatch(pipelineActions.createBox({
            projectId,
            pipeline: pipelineId,
            boxOrPipelineId: pipelineId,
          }));
          return;
        default:
          console.log(`Add ${type} block in progress...`);
          return;
      }
    },
    [dispatch, pipelineId, projectId, toggleBlocksModal],
  );

  const onBlockDelete = useCallback(
    (id, type) => {
      switch (type) {
        case Blocks.box.value:
          dispatch(pipelineActions.deleteBox({
            projectId,
            pipeline: pipelineId,
            boxOrPipelineId: id,
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

  const getLayoutedElements = useCallback((elements, direction = 'LR') => {
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

  const onConnect = useCallback(
    (params) => {
      setElements((els) => addEdge(params, els));
    },
    [setElements],
  );

  const onElementsRemove = useCallback(
    (elementsToRemove) => {
      setElements((els) => removeElements(elementsToRemove, els));
    },
    [setElements],
  );

  const onLoad = useCallback(
    (_reactFlowInstance) => {
      setReactFlowInstance(_reactFlowInstance);
    },
    [setReactFlowInstance],
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [],
  );

  const createBox = useCallback(
    () => {
      let boxOrPipelineId = pipelineId;
      if (selectedNodes) {
        boxOrPipelineId = selectedNodes[0].id;
      }

      dispatch(pipelineActions.createBox({ projectId, boxOrPipelineId, pipeline: pipelineId }));
    },
    [selectedNodes, projectId, pipelineId, dispatch],
  );


  const addDataToPipeline = useCallback(
    (type, id) => {
      if (selectedNodes) {
        let data = { projectId, 'boxId': selectedNodes[0].id, pipeline: pipelineId };
        if (type === 'task') {
          data.tasks_ids = [id];
        }
        if (type === 'resource') {
          data.resource_ids = [id];
        }
        dispatch(pipelineActions.createEdge(data));
      }
    },
    [selectedNodes, projectId, pipelineId, dispatch],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/nodeType');
      const dataId = event.dataTransfer.getData('application/reactflow/id');
      const dataType = event.dataTransfer.getData('application/reactflow/type');

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };
      setElements((es) => es.concat(newNode));

      if (dataType === 'new box') {
        createBox();
      } else if (dataType === 'task' || dataType === 'resource') {
        addDataToPipeline(dataType, dataId);
      }
    },
    [reactFlowWrapper, reactFlowInstance, createBox, addDataToPipeline, setElements],
  );

  const onSelectionChange = useCallback(
    (values) => {
      setSelectedNodes(values);
      },
    [setSelectedNodes],
  );

  const pipelineData = useMemo(
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
          label: pipeline._id,
        },
        position,
        isHidden: true,
      });
      result = recursion(pipeline, result, position);
      if (result.length === 1) {
        result = [];
      }
      result = getLayoutedElements(result);
      setElements(result);

      return result;
    },
    [pipeline, recursion, getLayoutedElements],
  );

  useEffect(
    () => {
      if (pipeline) {
        return;
      }
      dispatch(pipelineActions.fetchPipelines(projectId));
    },
    [dispatch, pipeline, pipelines, projectId],
  );

  useEffect(
    () => {
      if (!(pipelineData && reactFlowInstance)) {
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
    [pipelineData, reactFlowInstance],
  );

  return (
    <ReactFlowProvider>
      <Container>
        <Button
          className="pipeline-add-block"
          color={ButtonColors.secondary}
          onClick={toggleBlocksModal}
        >
          + blocks
        </Button>

        <FlowWrapper ref={reactFlowWrapper}>
          <ReactFlow
            nodeTypes={nodeTypes}
            elements={elements}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
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

        {showBlocksModal && (
          <BlocksModal
            header="Add Block"
            onClose={toggleBlocksModal}
            onBlockClick={onBlockAdd}
            open
          />
        )}
      </Container>
    </ReactFlowProvider>
  );
};

export default Pipeline;
