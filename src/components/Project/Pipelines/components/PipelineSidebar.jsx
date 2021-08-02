import React, { useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { selectors as projectsSelectors } from '@/redux/modules/projects';
import List, {
 ListItem, ListItemText, ListSubheader, ExpandLess, ExpandMore, StarBorder, ListItemIcon, Collapse,
} from '+components/List';

const useStyles = makeStyles((theme) => ({
  listItem: {
    paddingLeft: '30px',
  },
  listItemActive: {
    backgroundColor: theme.palette.background.sidebarItemActive,
  },
}));

const Sidebar = (key) => {
  const classes = useStyles();
  const [openTasks, setOpenTasks] = React.useState(false);
  const [openResources, setOpenResources] = React.useState(false);
  const project = useSelector(projectsSelectors.getProject(key.projectId));
  const onDragStart = useCallback(
    (event, nodeType) => {
      event.dataTransfer.setData('application/reactflow/nodeType', nodeType);
      event.dataTransfer.setData('application/reactflow/id', event.target.id);
      event.dataTransfer.setData('application/reactflow/type', event.target.type);
      event.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const resource_ids = useMemo(
    () => (project?.resource_ids || []),
    [project],
  );

  const taskIds = useMemo(
    () => (project?.taskIds || []),
    [project],
  );

  const resourceListItems = useMemo(
    () => resource_ids.map((resourceId) => (
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
    )),
    [resource_ids, classes.listItem, onDragStart],
  );

  const tasksListItems = useMemo(
    () => taskIds.map((taskId) => (
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
    )),
    [taskIds, classes.listItem, onDragStart],
  );

  const onExpandTasks = useCallback(
    (_ ) => {
      setOpenTasks(!openTasks);
      if (openResources) setOpenResources(!openResources);
    },
    [openTasks, openResources],
  );

  const onExpandResources = useCallback(
    (_ ) => {
      setOpenResources(!openResources);
      if (openTasks) setOpenTasks(!openTasks);
    },
    [openResources, openTasks],
  );


  return (
    <List>
      <ListSubheader component="div" id="subheader">
        add element to pipeline
      </ListSubheader>
      <ListItem onClick={(event) => onExpandResources(event)}>
        <ListItemText primary="resources" />
        {openResources ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openResources} timeout="auto" unmountOnExit>
        {resourceListItems}
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem>
        </List>
      </Collapse>
      <ListItem onClick={(event) => onExpandTasks(event)} >
        <ListItemText primary="tasks" />
        {openTasks ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openTasks} timeout="auto" unmountOnExit>
        {tasksListItems}
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem>
        </List>
      </Collapse>
      <ListItem
        type="new box"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        <ListItemText primary="New box" />
      </ListItem>
    </List>
  );
};

export default Sidebar;
