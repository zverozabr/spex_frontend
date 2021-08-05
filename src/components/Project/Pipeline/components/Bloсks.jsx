import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectors as projectsSelectors } from '@/redux/modules/projects';

import List, {
 ListItem, ListItemText, ListSubheader, ExpandLess, ExpandMore, Collapse,
} from '+components/List';

const useStyles = makeStyles((theme) => ({
  listItem: {
    whiteSpace: 'nowrap',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    margin: '6px',
    width: 'calc(100% - 12px)',
    '&:hover': {
      textDecoration: 'none',
      cursor: 'grab',
      backgroundColor: theme.palette.action.hover,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
  listItemCollapsed: {
    paddingLeft: '30px',
  },
}));

const Blocks = ({ projectId }) => {
  const classes = useStyles();

  const project = useSelector(projectsSelectors.getProject(projectId));

  const [openTasks, setOpenTasks] = useState(false);
  const [openResources, setOpenResources] = useState(false);

  const onDragStart = useCallback(
    (event, nodeType) => {
      event.dataTransfer.setData('application/reactflow/nodeType', nodeType);
      event.dataTransfer.setData('application/reactflow/id', event.target.id);
      event.dataTransfer.setData('application/reactflow/type', event.target.type);
      event.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const resourceIds = (project?.resource_ids || []);
  const taskIds = (project?.taskIds || []);

  const onExpandTasks = useCallback(
    (_ ) => {
      setOpenTasks(!openTasks);
      if (openResources) {
        setOpenResources(!openResources);
      }
    },
    [openTasks, openResources],
  );

  const onExpandResources = useCallback(
    (_ ) => {
      setOpenResources(!openResources);
      if (openTasks) {
        setOpenTasks(!openTasks);
      }
    },
    [openResources, openTasks],
  );

  return (
    <List>
      <ListSubheader component="div" id="subheader">
        Blocks
      </ListSubheader>

      <ListItem
        className={classes.listItem}
        type="new box"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <ListItemText primary="Box" />
      </ListItem>

      <ListItem
        className={classes.listItem}
        type="new job"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <ListItemText primary="Job" />
      </ListItem>

      <ListItem onClick={(event) => onExpandResources(event)}>
        <ListItemText primary="Resource" />
        {openResources ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={openResources} timeout="auto" unmountOnExit>
        {resourceIds.map((resourceId) => (
          <ListItem
            key={resourceId}
            id={resourceId}
            className={classNames(classes.listItem, classes.listItemCollapsed)}
            type="resource"
            onDragStart={(event) => onDragStart(event, 'output')}
            draggable
          >
            <ListItemText primary={resourceId} />
          </ListItem>
        ))}
      </Collapse>

      <ListItem onClick={(event) => onExpandTasks(event)} >
        <ListItemText primary="Task" />
        {openTasks ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={openTasks} timeout="auto" unmountOnExit>
        {taskIds.map((taskId) => (
          <ListItem
            key={taskId}
            id={taskId}
            className={classNames(classes.listItem, classes.listItemCollapsed)}
            type="task"
            onDragStart={(event) => onDragStart(event, 'output')}
            draggable
          >
            <ListItemText primary={taskId} />
          </ListItem>
        ))}
      </Collapse>
    </List>
  );
};

Blocks.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Blocks;
