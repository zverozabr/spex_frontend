import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
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
import styled from 'styled-components';

import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';
import Button, { ButtonColors, ButtonSizes } from '+components/Button';
import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import { Field, Controls as FormControls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import List, { ListItem, ListItemText, ListSubheader } from '+components/List';
import ButtonsContainer from './ButtonsContainer';
import Col from './Col';
import Sidebar from './PipelineSidebar';

const nodeWidth = 172;
const nodeHeight = 36;

const useStyles = makeStyles((theme) => ({
  listItem: {
    paddingLeft: '24px',
  },
  listItemActive: {
    backgroundColor: theme.palette.background.sidebarItemActive,
  },
}));

let id = 0;
const getId = () => `dndnode_${id++}`;

const Container = styled(Col)`
  aside {
    border-right: 1px solid #eee;
    padding: 15px 10px;
    font-size: 12px;
    background: #fcfcfc;

    > * {
      margin-bottom: 10px;
      cursor: grab;
    }

    .description {
      margin-bottom: 10px;
    }
  }

  .reactflow-wrapper {
    flex-grow: 1;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  @media screen and (min-width: 768px) {
    & aside {
      //width: 20%;
      max-width: 180px;
    }
  }
`;

const Pipeline = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const projectId = useMemo(
    () => {
      const match = matchPath(pathname, { path: `/${PathNames.projects}/:id` });
      return match ? match.params.id : undefined;
    },
    [pathname],
  );
  const classes = useStyles();

  const pipelines = useSelector(pipelineSelectors.getPipelines(projectId));
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dagreGraph] = useState(new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({})));
  const [activePipelineTab, setActivePipelineTab] = useState(null);
  const [addPipelineModalOpen, setAddPipelineModalOpen] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);

  const recursion = useCallback(
    (data, elements, position) => {
      if (!data['boxes']) {
        return elements;
      }

      data['boxes'].forEach((element) => {
        elements.push({ id: element.id, type: 'input', data: { label: 'box/' + element.id }, position });
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
    [],
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
      let boxOrPipeline = activePipelineTab;
      if (selectedNodes) {
        boxOrPipeline = selectedNodes[0].id;
      };
      dispatch(pipelineActions.createBox([projectId, boxOrPipeline]));
      setElements((es) => es.concat(newNode));
    },
    [setElements, reactFlowWrapper, reactFlowInstance, dispatch, selectedNodes, projectId, activePipelineTab],
  );


  const onPipelineTabChange = useCallback(
    (_, id) => {
      setActivePipelineTab(id);
    },
    [],
  );

  const onAddPipelineModalOpen = useCallback(
    () => {
      setAddPipelineModalOpen(true);
    },
    [],
  );

  const onAddPipelineClose = useCallback(
    () => {
      setAddPipelineModalOpen(false);
    },
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
    [dispatch, pipelineToDelete, projectId, pipelines],
  );

  const onPipelinesChanged = useCallback(
    (values) => {
      setAddPipelineModalOpen(false);
      dispatch(pipelineActions.createPipeline({
        ...values,
        'project': projectId.toString(),
      }));
    },
    [dispatch, projectId],
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
      if (!(Object.keys(pipelines || {}).length > 0 && activePipelineTab)) {
        return result;
      }

      const p = activePipelineTab;
      const position = { x: 0, y: 0 };

      if (!pipelines[p]) {
        return result;
      }

      result.push({
        id: pipelines[p].id,
        type: 'input',
        data: {
          label: pipelines[p]._id,
        },
        position,
        isHidden: true,
      });
      result = recursion(pipelines[p], result, position);
      if (result.length === 1) {
        result = [];
      }
      result = getLayoutedElements(result);
      setElements(result);

      return result;
    },
    [pipelines, recursion, getLayoutedElements, activePipelineTab],
  );

  const pipelineListItems = useMemo(
    () => Object.values(pipelines || {}).map((p) => (
      <ListItem
        className={classes.listItem}
        button
        key={p.id}
        selected={activePipelineTab === p.id}
        onClick={(event) => onPipelineTabChange(event, p.id)}
      >
        <ListItemText primary={p.id + '|'+ p.name} />
      </ListItem>
    )),
    [pipelines, activePipelineTab, onPipelineTabChange, classes.listItem],
  );

  useEffect(
    () => {
      if (Array.isArray(pipelines) || Object.keys(pipelines || {}).length > 0) {
        return;
      }

      dispatch(pipelineActions.fetchPipelines(projectId));
    },
    [dispatch, pipelines, projectId],
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

  useEffect(
    () => {
      const [key] = Object.keys(pipelines || {});
      setActivePipelineTab((prev) => {
        if (key && !prev) {
          return key;
        }

        if (!key && prev) {
          return null;
        }

        return prev;
      });
    },
    [pipelines, activePipelineTab],
  );

  return (
    <React.Fragment>
      <Container>
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
        </ButtonsContainer>
        <List>
          <ListSubheader component="div" id="subheader">
            Pipelines
          </ListSubheader>
          {pipelineListItems}
        </List>
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
              elementsSelectable
              onSelectionChange={onSelectionChange}
            >
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </Container>
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
    </React.Fragment>
  );
};

export default Pipeline;
