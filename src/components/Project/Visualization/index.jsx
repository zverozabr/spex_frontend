import React, {
  Fragment, useRef, useState, useMemo, useCallback, useEffect,
} from 'react';
import List from '@material-ui/core/List';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';


import PathNames from '@/models/PathNames';
import { actions as pipelineActions, selectors as pipelineSelectors } from '@/redux/modules/pipelines';

import Button from '+components/Button';
import Link from '+components/Link';
import Table from '+components/Table';
import Tabs, { Tab, TabPanel, Box } from '+components/Tabs';
import ButtonsContainer from './components/ButtonsContainer.jsx';
import ShowVisualizeModal from './components/ShowVisualizeModal';
import SubComponent from './components/SubComponent';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// import Card from '@material-ui/core/Card';
// import CardHeader from '@material-ui/core/CardHeader';
// import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
// import Typography from '@material-ui/core/Typography';
// import { CardActionArea, CardActions } from '@material-ui/core';

const refreshInterval = 6e4; // 1 minute

const Visualization = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const matchProjectPath = matchPath(location.pathname, { path: `/${PathNames.projects}/:id` });
  const projectId = matchProjectPath ? matchProjectPath.params.id : undefined;
  const pipelines = useSelector(pipelineSelectors.getPipelinesWithTasksForVis(projectId)) || {};

  const [pipelineToManage, setPipelineToManage] = useState(null);
  const [tasksToShow, setTasksToShow] = useState([]);
  const [taskToPanels, setTasksToPanels] = useState([]);
  const [refresher, setRefresher] = useState(null);
  const selectedRef = useRef({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDataTab, setActiveDataTab] = useState('');

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

  const onDataTabChange = useCallback(
    (_, id) => {
      setActiveDataTab(id);
      let taskList = [];
      if (Object.keys(pipelines).length === 0) {
        return;
      }
      Object.values(pipelines).forEach(function (o) {
        o.jobs.forEach(function (job) {
          if ([id].includes(job.id) === true) {taskList = [...taskList, ...job.tasks];}
        });
      });

      if (taskToPanels !== taskList) {
        setTasksToPanels(taskList);
      }
    },
    [pipelines, taskToPanels],
  );

  const tabsData = useMemo(
    () => {
      if (Object.values(pipelines).length === 0 || selectedRows.length === 0) {
        return [];
      }
      let tabs = [];
      // Object.values(pipelines)[0]["jobs"][0]["id"]
      Object.values(pipelines).map(function (pipeline) {
        let curr_pipeline_job_ids = pipeline.jobs.map((job) => {
          return job.id;
        });

        tabs = selectedRows.filter(((n) => curr_pipeline_job_ids.includes(n)));
        setActiveDataTab(tabs[0]);
      });

      return tabs;
    },

    [selectedRows, pipelines, onDataTabChange],
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
      <Box>
        <Tabs
          value={activeDataTab}
          onChange={onDataTabChange}
        >
          {Object.values(tabsData).map((type) => (
            <Tab
              key={type}
              label={type}
              value={type}
            />
          ))}
        </Tabs>
      </Box>
      <List dense component="div">
        {taskToPanels.map((type) => (
          <ListItem component="div" key={type.id}>
            <ListItemText
              primary={`task id: ${type.id}.`}
            />
          </ListItem>
        ))}
      </List>

      {/*<Card sx={{ maxWidth: 345 }}>*/}
      {/*  <CardActionArea>*/}
      {/*    <CardMedia*/}
      {/*      component="img"*/}
      {/*      height="140"*/}
      {/*      image="https://mui.com/static/images/cards/contemplative-reptile.jpg"*/}
      {/*      alt="green iguana"*/}
      {/*    />*/}
      {/*    <CardContent>*/}
      {/*      <Typography gutterBottom variant="h5" component="div">*/}
      {/*        Lizard*/}
      {/*      </Typography>*/}
      {/*      <Typography variant="body2" color="text.secondary">*/}
      {/*        Lizards are a widespread group of squamate reptiles, with over 6,000*/}
      {/*        species, ranging across all continents except Antarctica*/}
      {/*      </Typography>*/}
      {/*    </CardContent>*/}
      {/*  </CardActionArea>*/}
      {/*  <CardActions>*/}
      {/*    <Button size="small" color="primary">*/}
      {/*      Share*/}
      {/*    </Button>*/}
      {/*  </CardActions>*/}
      {/*</Card>*/}



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
