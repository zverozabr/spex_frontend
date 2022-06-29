// import React from 'react';
//
// const Visualization = () => (<div>Visualization</div>);
//
// export default Visualization;
import React, {
  Fragment, useRef, useState, useMemo, useCallback, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';


import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import Button from '+components/Button';
import Link from '+components/Link';
import Table from '+components/Table';

import ButtonsContainer from './components/ButtonsContainer.jsx';
import ShowVisualizeModal from './components/ShowVisualizeModal';
import SubComponent from './components/SubComponent';


const defaultPipeline = {
  name: '',
};

const refreshInterval = 6e4; // 1 minute

const Visualization = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;
  const pipelines = useSelector(pipelineSelectors.getPipelinesWithTasksForVis(projectId)) || {};

  const [pipelineToManage, setPipelineToManage] = useState(null);
  const [tasksToShow, setTasksToShow] = useState([]);
  const [refresher, setRefresher] = useState(null);
  const selectedRef = useRef({});
  const [selectedRows, setSelectedRows] = useState([]);

  const onShowVisualize = useCallback(
    (selectedRows, pipelines) => {
      let taskList = [];
      Object.values(pipelines).forEach(function (o) {
        o.jobs.forEach(function (job) {
          if (selectedRows.includes(job.id) === true) {taskList = [...taskList, ...job.tasks];}
        });
      });
      setTasksToShow(taskList);
    },
    [],
  );

  const onShowVisualizeClose = useCallback(
    () => {
      setTasksToShow([]);
    },
    [],
  );

  const onSelectedRowsChange = useCallback(
    (selected, parent) => {
      // console.log({ selected, parent });

      selectedRef.current[parent.id] = selected.map(({ id }) => id);
      const selected2 = Object.values(selectedRef.current).flat();
      setSelectedRows(selected2);
    },
    [],
  );

  const onManagePipelineModalSubmit = useCallback(
    (values) => {
      const normalizedPipeline = {
        ...values,
      };

      if (normalizedPipeline.id) {
        dispatch(pipelineActions.updatePipeline(normalizedPipeline));
      } else {
        dispatch(pipelineActions.createPipeline(normalizedPipeline));
      }

      setPipelineToManage(null);
    },
    [dispatch],
  );

  const columns = useMemo(
    () => ([{
      accessor: 'id',
      Header: 'id',
      getCellProps: () => ({ style: { textTransform: 'capitalize' } }),
      Cell: ({ row: { original: { id } } }) => useMemo(
        () => (
          <Link
            to={`/${PathNames.projects}/${projectId}/${PathNames.pipelines}/${id}`}
            underline="always"
          >
            {id}
          </Link>
        ),
        [id],
      ),
      minWidth: 50,
      maxWidth: 50,
    }, {
      accessor: 'name',
      Header: 'name',
      getCellProps: () => ({ style: { textTransform: 'capitalize' } }),
      Cell: ({ row: { original: { name, id } } }) => useMemo(
        () => (
          <Link
            to={`/${PathNames.projects}/${projectId}/${PathNames.pipelines}/${id}`}
            underline="always"
          >
            {name}
          </Link>
        ),
        [id, name],
      ),
    }]),
    [projectId],
  );

  useEffect(
    () => {
      if (!projectId) {
        return;
      }
      dispatch(pipelineActions.fetchPipelinesForVis(projectId));
    },
    [dispatch, projectId, refresher],
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

  const WithSelected = useCallback(
    (subProps) => {
      return (
        <SubComponent
          {...subProps}
          onSelectedRowsChange={(selected) => onSelectedRowsChange(selected, subProps)}
        />
      );
    },
    [onSelectedRowsChange],
  );

  const pipelineData = useMemo(
    () => {
      if (pipelines.length === 0 || Object.keys(pipelines).length === 0) {
        return [];
      }
      return Object.values(pipelines);
    },

    [pipelines],
  );


  return (
    <Fragment>
      <ButtonsContainer>
        <Button onClick={() => {
          onShowVisualize(selectedRows, pipelines);
        }}
        >
          Show vis
        </Button>
      </ButtonsContainer>

      <Table
        onSelectedRowsChange={setSelectedRows}
        columns={columns}
        selectedRowIds={pipelineToManage}
        data={pipelineData}
        SubComponent={WithSelected}
      />

      {tasksToShow.length > 0 && (
        <ShowVisualizeModal
          // header={`${pipelineToManage.id ? 'Edit' : 'Add'} Pipeline`}
          // header={tasksToShow}
          initialValues={tasksToShow}
          onClose={onShowVisualizeClose}
          onSubmit={onManagePipelineModalSubmit}
          open
        />
      )}
    </Fragment>
  );
};

export default Visualization;
