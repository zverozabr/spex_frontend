import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dagre from 'dagre';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  isNode,
} from 'react-flow-renderer';


import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';
import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';
import Button, { ButtonColors, ButtonSizes } from '+components/Button';
import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import { Field, Controls as FormControls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import Tabs, { Tab } from '+components/Tabs';
import ButtonsContainer from './ButtonsContainer';
import Sidebar from './PipelineSidebar';
import Row from './Row';


import './dnd.css';

const nodeWidth = 172;
const nodeHeight = 36;

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const projectId = useMemo(
	() => {
	  const match = matchPath(pathname, { path: `/${PathNames.projects}/:id` });
	  return match ? match.params.id : undefined;
	},
	[pathname],
  );
  const pipelines = useSelector(pipelineSelectors.getPipelines(projectId));
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const [dagreGraph] = useState(new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})));
  const [activePipelineTab, setActivePipelineTab] = useState(false);
  const [addPipelineModalOpen, setAddPipelineModalOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete ] = useState(null);

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

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
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
    },
    [setElements, reactFlowWrapper, reactFlowInstance],
  );

  const onPipelineTabChange = useCallback(
    (_, id) => {
      setActivePipelineTab(id);
    },
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
      setActivePipelineTab(Object.keys(pipelines)[0]);
    },
    [dispatch, pipelineToDelete, projectId, pipelines, setActivePipelineTab],
  );

  const onPipelinesChanged = useCallback(
    (values) => {
      setAddPipelineModalOpen(false);
      dispatch(pipelineActions.createPipeline({ ...values, 'project': projectId.toString() }));
    },
    [dispatch, projectId],
  );

  const pipelineData = useMemo(
    () => {
      if (Object.keys(pipelines || {}).length > 0 && activePipelineTab !== false ) {
      let data = [];
      const p = activePipelineTab;
      const position = { x: 0, y: 0 };

      data.push({ id: pipelines[p].id, type: 'input', data: { label: pipelines[p]._id }, position, isHidden: true });
      data = recursion(pipelines[p], data, position);
      if (data.length === 1) return [];
      const result = getLayoutedElements(data);
      setElements(result);
      return result;
      } else {
      return [];
      };
    },
    [pipelines, recursion, getLayoutedElements, activePipelineTab],
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
      if (Object.keys(pipelines || {}).length > 0 && activePipelineTab === false) {
      setActivePipelineTab(Object.keys(pipelines)[0]);
      }
    },
    [activePipelineTab, pipelines],
  );

  return (
    <div className="dndflow">
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
          {/* <Tabs value={activePipelineTab} onChange={onPipelineTabChange}>
            {pipelineTabs}
          </Tabs> */}
        </ButtonsContainer>
        <Tabs value={activePipelineTab} onChange={onPipelineTabChange}>
          {pipelineTabs}
        </Tabs>
        <ReactFlowProvider>
          <Sidebar />
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              elements={elements}
              onConnect={onConnect}
              onElementsRemove={onElementsRemove}
              onLoad={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </Row>
      {addPipelineModalOpen && (
        <FormModal
          header="Add pipeline"
          project={projectId}
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
    </div>
  );
};

export default DnDFlow;
