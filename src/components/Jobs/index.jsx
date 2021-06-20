import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PathNames from '@/models/PathNames';

import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';

import Button, { ButtonSizes, ButtonColors } from '+components/Button';
import ConfirmModal, { ConfirmActions } from '+components/ConfirmModal';
import { Field, Controls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import Link from '+components/Link';
import Table from '+components/Table';

import ButtonsContainer from './components/ButtonsContainer';
import CellButtonsContainer from './components/CellButtonsContainer';
import Container from './components/Container';
import Row from './components/Row';

const Jobs = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(jobsSelectors.getJobs);

  const [ jobToManage, setJobToManage ] = useState(null);
  const [ jobToDelete, setJobToDelete ] = useState(null);

  const onManageJobModalOpen = useCallback(
    (job) => { setJobToManage(job); },
    [],
  );

  const onManageJobModalClose = useCallback(
    () => { setJobToManage(null); },
    [],
  );

  const onManageJobModalSubmit = useCallback(
    (job) => {
      if (job.id) {
        dispatch(jobsActions.updateJob(job));
      } else {
        dispatch(jobsActions.createJob(job));
      }
      setJobToManage(null);
    },
    [dispatch],
  );

  const onDeleteJobModalOpen = useCallback(
    (job) => { setJobToDelete(job); },
    [],
  );

  const onDeleteJobModalClose = useCallback(
    () => { setJobToDelete(null); },
    [],
  );

  const onDeleteProjectModalSubmit = useCallback(
    () => {
      dispatch(jobsActions.deleteProject(jobToDelete.id));
      setJobToDelete(null);
    },
    [dispatch, jobToDelete],
  );

  const columns = useMemo(
    () => ([{
      id: 'name',
      accessor: 'name',
      Header: 'Name',
      Cell: ({ row: { original: { id, name } } }) => useMemo(
        () => (
          <Link to={`/${PathNames.projects}/${id}`}>
            {name}
          </Link>
        ),
        [id, name],
      ),
    }, {
      id: 'description',
      accessor: 'description',
      Header: 'Description',
    }, {
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
              onClick={() => onDeleteJobModalOpen(original)}
            >
              Delete
            </Button>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
              onClick={() => onManageJobModalOpen(original)}
            >
              Edit
            </Button>
          </CellButtonsContainer>
        ),
        [original],
      ),
    }]),
  [onDeleteJobModalOpen, onManageJobModalOpen],
  );

  return (
    <Container>
      <Row>
        <ButtonsContainer>
          <Button onClick={() => onManageJobModalOpen({})}>
            Add Job
          </Button>
        </ButtonsContainer>

        <Table
          columns={columns}
          data={Object.values(jobs)}
          allowRowSelection
        />
      </Row>

      {jobToManage && (
        <FormModal
          header={`${jobToManage.id ? 'Edit' : 'Add'} Job`}
          initialValues={jobToManage}
          onClose={onManageJobModalClose}
          onSubmit={onManageJobModalSubmit}
          open
        >
          <Field
            name="name"
            label="Name"
            component={Controls.TextField}
            validate={Validators.required}
            required
          />

          <Field
            name="description"
            label="Description"
            component={Controls.TextField}
            multiline
            rows={6}
          />
        </FormModal>
      )}

      {jobToDelete && (
        <ConfirmModal
          action={ConfirmActions.delete}
          item={jobToDelete.name}
          onClose={onDeleteJobModalClose}
          onSubmit={onDeleteProjectModalSubmit}
          open
        />
      )}
    </Container>
  );
};

export default Jobs;
