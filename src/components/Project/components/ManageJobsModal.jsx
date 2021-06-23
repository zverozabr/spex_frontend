/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';
import { actions as omeroActions } from '@/redux/modules/omero';

import Button, { ButtonColors, ButtonSizes } from '+components/Button';
import Link from '+components/Link';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';
import Select, { Option } from '+components/Select';
import Table from '+components/Table';
import SubComponent from './SubComponent';
import CellButtonsContainer from './CellButtonsContainer';


import Row from './Row';


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
    onSubmit
  } = props;

  const dispatch = useDispatch();


  const [value] = useState([]);


  const isJobsFetching = useSelector(jobsSelectors.isFetching);
  const jobs = useSelector(jobsSelectors.getJobs);


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
    }, {
      id: 'actions',
      Header: 'Actions',
      minWidth: 110,
      maxWidth: 110,
      Cell: ({ row: { original } }) => useMemo(
        () => (
          <CellButtonsContainer>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"

            >
              Delete
            </Button>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
            >
              Copy
            </Button>
          </CellButtonsContainer>
        ),
        [original],
        ),
      }]),
      [],
    );

  const emitSubmit = useCallback(
    () => {
      const selected = value.map((el) => String(el?.id) || String(el));
      onSubmit(selected);
    },
    [onSubmit, value],
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

  return (
    <Modal
      className={className}
      open={open}
      onClose={onClose}
    >
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        <Row>
          <Select
            defaultValue={none}
            disabled={isJobsFetching}
          >
            <Option value={none}>Select jobs</Option>
            {Object.values(jobs || {}).map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
          </Select>
          <Table
            columns={columns}
            data={Object.values(jobs)}
            SubComponent={SubComponent}
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
