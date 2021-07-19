/* eslint-disable react/jsx-sort-default-props */
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as tasksActions, selectors as tasksSelectors } from '@/redux/modules/tasks';

import FormModal from '+components/FormModal';

const TaskFormModal = styled((props) => {
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

  const taskId = initialValues?.id;
  const omeroImageId = initialValues?.omeroId;

  const taskImage = useSelector(tasksSelectors.getTaskImage(taskId));
  const omeroImageDetails = useSelector(omeroSelectors.getImageDetails(omeroImageId));

  console.log(taskId);
  console.log(taskImage);
  console.log(omeroImageDetails);

  useEffect(
    () => {
      if (!taskId) {
        return undefined;
      }

      dispatch(tasksActions.fetchTaskImage(taskId));
      return () => {
        dispatch(tasksActions.clearTaskImage(taskId));
      };
    },
    [dispatch, taskId],
  );

  useEffect(
    () => {
      if (!omeroImageId) {
        return undefined;
      }

      dispatch(omeroActions.fetchImageDetails(omeroImageId));
      return () => {
        dispatch(omeroActions.clearImageDetails(omeroImageId));
      };
    },
    [dispatch, omeroImageId],
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
      <img src={taskImage} />
    </FormModal>
  );
})`
  .modal-content {
    width: 80%;
    min-width: 840px;
    max-width: 1280px;
  }
  
  .modal-body {
    display: flex;
    flex-direction: row;
    min-height: 540px;
  }
`;

TaskFormModal.propTypes = {
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
  initialValues: PropTypes.shape({}),
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
   * A callback fired when data is changed.
   */
  onChange: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

TaskFormModal.defaultProps = {
  className: '',
  header: '',
  initialValues: null,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  onClose: () => {},
  onSubmit: () => {},
};

export default TaskFormModal;
