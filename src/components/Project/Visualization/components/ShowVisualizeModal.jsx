/* eslint-disable react/jsx-sort-default-props */
import React, { useCallback } from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import DynamicFeedOutlinedIcon from '@material-ui/icons/DynamicFeedOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';

import FormModal from '+components/FormModal';
import { useDispatch } from 'react-redux';
import Button from '+components/Button';
import WallpaperIcon from '@material-ui/icons/Wallpaper';
import { actions as tasksActions } from '@/redux/modules/tasks';

const ShowVisualizeModal = (props) => {
  const {
    className,
    header,
    initialValues,
    closeButtonText,
    submitButtonText,
    open,
    onClose,
    onSubmit,
  } = props;

  const dispatch = useDispatch();

  const onLoadVisualise = useCallback(
    () => {
      // dispatch(tasksActions.fetchTaskVisualize({ id, key: key }));
      initialValues.map((item) => {
        dispatch(tasksActions.fetchTaskVisualize({ id: item.id, name: item.name }));
      });

    },
    [dispatch, initialValues],
  );


  return (
    <FormModal
      className={className}
      header={header}
      initialValues={initialValues}
      closeButtonText={closeButtonText}
      submitButtonText={submitButtonText}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Accordion expanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <DynamicFeedOutlinedIcon /> Tasks
        </AccordionSummary>
        <AccordionDetails>
          <List dense component="div">
            {initialValues.map((item) => (
              <ListItem component="div" key={item}>
                <ListItemText
                  primary={`task id: ${item.id}.`}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Button
        size="small"
        variant="outlined"
        onClick={onLoadVisualise}
        startIcon={<WallpaperIcon />}
      >
        Render value
      </Button>
    </FormModal>
  );
};

ShowVisualizeModal.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Modal title.
   */
  header: PropTypes.string,
  /**
   * Initial values.
   */
  initialValues: PropTypes.shape([]),
  /**
   * Text for the close button.
   */
  closeButtonText: PropTypes.string,
  /**
   * Text for the confirm button.
   */
  submitButtonText: PropTypes.string,
  /**
   * If true, the modal is open.
   */
  open: PropTypes.bool,
  /**
   * Callback fired when the component requests to be closed.
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

ShowVisualizeModal.defaultProps = {
  className: '',
  header: '',
  initialValues: [1, 2],
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  onClose: () => {},
  onSubmit: () => {},

};

export default ShowVisualizeModal;
