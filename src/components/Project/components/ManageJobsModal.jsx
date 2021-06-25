/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';
import { actions as omeroActions } from '@/redux/modules/omero';

import Button, { ButtonColors, ButtonSizes } from '+components/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';
import Table, { ButtonsCell } from '+components/Table';

import Row from './Row';
import SubComponent from './SubComponent';

const none = 'none';

const ManageJobsModal = styled((props) => {
  const {
    className,
    header,
    project,
    closeButtonText,
    submitButtonText,
    onClose,
    open,
    onSubmit,
  } = props;

  const dispatch = useDispatch();

  const [value] = useState([]);

  const isJobsFetching = useSelector(jobsSelectors.isFetching);
  const jobs = useSelector(jobsSelectors.getJobs);
  const selectedRef = useRef({});

  const columns = useMemo(
    () => ([{
      id: 'status',
      accessor: ({ tasks }) => {
        if (!tasks.length) {
          return undefined;
        }
        const sum = tasks.reduce((acc, el) => acc + el.status, 0);
        return sum / tasks.length;
      },
      Header: 'Status',
      Cell: ({ value: status }) => useMemo(
        () => (status != null ? `In Progress (${Math.round(status * 100)}%)` : 'N/A'),
        [status],
      ),
    }, {
      id: 'name',
      accessor: 'name',
      Header: 'Name',
      Cell: ({ row: { original: { id, name } } }) => useMemo(
        () => (
          // <Link to={`/${PathNames.jobs}/${id}`}>
          <div> {name} </div>
          // </Link>
        ),
        [id, name],
      ),
    }, {
      id: 'omeroIds',
      accessor: 'omeroIds',
      Header: 'Omero Image IDs',
    }]),
      [],
    );

  const data = useMemo(
    () => Object.values(jobs),
    [jobs],
  );
  const emitSubmit = useCallback(
    () => {
      const selected = Object.values(selectedRef.current).flat();
      onSubmit(project, selected);
    },
    [onSubmit],
  );

  const emitCancel = useCallback(
    () => {
      dispatch(omeroActions.fetchThumbnails({
        groupId: project.id,
        imageIds: project.omeroIds,
      }));
    onClose();
    },
    [dispatch, onClose, project],
  );

  useEffect(
    () => {
      if (!project?.omeroIds?.length) {
        return undefined;
      }

      dispatch(omeroActions.fetchThumbnails({
        groupId: project.id,
        imageIds: project.omeroIds,
      }));
    },
    [dispatch, project?.id, project?.omeroIds],
  );

  useEffect(
    () => {
      if (Object.keys(jobs || {}).length) {
        return;
      }
      dispatch(jobsActions.fetchJobs({}));
    },
    [dispatch, jobs],
  );

  const onSelectedRowsChange = useCallback(
    (selected, parent) => {
      // console.log({ selected, parent });
      selectedRef.current[parent.id] = selected.map(({ id }) => id);
    },
    [],
  );

  const WithSelected = useCallback(
    (subProbs) => {
      // console.log({ subProbs });

      return (
        <SubComponent
          {...subProbs}
          selectedRowIds={project.taskIds}
          onSelectedRowsChange={(selected) => onSelectedRowsChange(selected, subProbs)}
        />
      );
    },
    [onSelectedRowsChange],
  );

  return (
    <Modal
      className={className}
      open={open}
      onClose={onClose}
    >
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        <Row>
          <Table
            columns={columns}
            data={data}
            SubComponent={WithSelected}
          />
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          color={ButtonColors.secondary}
          onClick={emitCancel}
        >
          {closeButtonText}
        </Button>
        <Button
          color={ButtonColors.primary}
          onClick={emitSubmit}
        >
          {submitButtonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
})`
  ${Row} + ${Row} {
    margin-top: 20px;
  }

  .transfer-list {
    height: 300px;
    margin: 0 auto;
  }
`;

ManageJobsModal.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Modal title.
   */
  header: PropTypes.string,
  /**
   * If true, the modal is open.
   */
  open: PropTypes.bool,
  /**
   * Text for the close button.
   */
  closeButtonText: PropTypes.string,
  /**
   * Text for the confirm button.
   */
  submitButtonText: PropTypes.string,
  /**
   * Callback fired when the component requests to be closed. .
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

ManageJobsModal.defaultProps = {
  className: '',
  header: '',
  open: false,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  onClose: () => {},
  onSubmit: () => {},
};

export default ManageJobsModal;
