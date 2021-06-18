/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
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
    onSubmit,
  } = props;

  const dispatch = useDispatch();


  const [value, setValue] = useState([]);
  const [setOpen] = useState(false);


  const isJobsFetching = useSelector(jobsSelectors.isFetching);
  const jobs = useSelector(jobsSelectors.getJobs);
  const emitOpen = useCallback(
    () => {
      setOpen(!open);
    },
    [open, setOpen],
  );

  const columns = useMemo(
    () => ([{
      id: 'name',
      accessor: 'name',
      Header: 'Name',
      Cell: ({ row: { original: { id, name } } }) => useMemo(
        () => (
          <Link to={`/${id}`}>
            {name}
          </Link>
        ),
        [id, name],
      ),
    },
    {
      id: 'tasks',
      header: 'tasks',
      Cell: ({ row: { original: { tasks } } }) => useMemo(
        () => (
          [tasks]
        ),
        [tasks],
      ),

    },
    {
      // Build our expander column
      id: 'expander', // Make sure it has an ID
      Header: ({ row.getToggleAllRowsExpandedProps, row.isAllRowsExpanded }) => (
        <span {...getToggleAllRowsExpandedProps()}>
          {isAllRowsExpanded ? '👇' : '👉'}
        </span>
      ),
      Cell: ({ row }) =>
        // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
        // to build the toggle for expanding a row
        row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                // We can even use the row.depth property
                // and paddingLeft to indicate the depth
                // of the row
                paddingLeft: `${row.depth * 2}rem`,
              },
            })}
          >
            {row.isExpanded ? '👇' : '👉'}
          </span>
        ) : null,
    },
    // {
    //   id: 'content',
    //   accessor: 'content',
    //   Header: 'Content',
    // },
    {
      id: 'actions',
      Header: 'Actions',
      minWidth: 80,
      maxWidth: 80,
      Cell: ({ row: { original } }) => useMemo(
        () => (
          <CellButtonsContainer>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
            >
              Edit
            </Button>
          </CellButtonsContainer>
        ),
        [],
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
            allowRowSelection
            hasExpander
            groupBy={jobs['tasks']}
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
