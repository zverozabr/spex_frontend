import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectors as projectsSelectors } from '@/redux/modules/projects';

import List, {
 ListItem, ListItemText, ListSubheader, ExpandLess, ExpandMore, Collapse,
} from '+components/List';

const useStyles = makeStyles((theme) => ({
  listItem: {
    paddingLeft: '30px',
  },
  listItemActive: {
    backgroundColor: theme.palette.background.sidebarItemActive,
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
        type="new box"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <ListItemText primary="Add box" />
      </ListItem>

      <ListItem onClick={(event) => onExpandResources(event)}>
        <ListItemText primary="Add resource" />
        {openResources ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={openResources} timeout="auto" unmountOnExit>
        {resourceIds.map((resourceId) => (
          <ListItem
            className={classes.listItem}
            key={resourceId}
            id={resourceId}
            type="resource"
            onDragStart={(event) => onDragStart(event, 'output')}
            draggable
          >
            <ListItemText primary={resourceId} />
          </ListItem>
        ))}
      </Collapse>

      <ListItem onClick={(event) => onExpandTasks(event)} >
        <ListItemText primary="Add task" />
        {openTasks ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={openTasks} timeout="auto" unmountOnExit>
        {taskIds.map((taskId) => (
          <ListItem
            className={classes.listItem}
            key={taskId}
            id={taskId}
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
