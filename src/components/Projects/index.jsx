import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';

import { ButtonColors } from '+components/Button';
import { Field, Controls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import Table from '+components/Table';

import Container from './components/Container';

const columns = [{
  id: 'name',
  accessor: 'name',
  Header: 'Name',
}, {
  id: 'description',
  accessor: 'description',
  Header: 'Description',
}];

const Projects = () => {
  const dispatch = useDispatch();

  const projects = useSelector(projectsSelectors.getProjects);

  const [ addProjectModalOpen, setAddProjectModalOpen ] = useState(false);

  const onProjectModalOpen = useCallback(
    () => { setAddProjectModalOpen(true); },
    [],
  );

  const onProjectModalClose = useCallback(
    () => { setAddProjectModalOpen(false); },
    [],
  );

  const onProjectModalSubmit = useCallback(
    (values) => {
      dispatch(projectsActions.createProject(values));
      setAddProjectModalOpen(false);
    },
    [dispatch],
  );

  const actions = useMemo(
    () => ([{
      name: 'Delete Selected',
      // eslint-disable-next-line no-console
      fn: (rows) => console.log('delete', rows),
      color: ButtonColors.danger,
      enabledOnlyWhenSelectedRows: true,
    }, {
      name: 'Add Project',
      // eslint-disable-next-line no-console
      fn: onProjectModalOpen,
      color: ButtonColors.primary,
    }]),
    [onProjectModalOpen],
  );

  useEffect(
    () => {
      if (projects.length) {
        return;
      }
      dispatch(projectsActions.fetchProjects());
    },
    [dispatch, projects.length],
  );

  useEffect(
    () => () => {
      dispatch(projectsActions.clearProjects());
    },
    [dispatch],
  );

  return (
    <Container>
      <Table
        actions={actions}
        columns={columns}
        data={projects}
        allowRowSelection
      />
      <FormModal
        header="Add Project"
        open={addProjectModalOpen}
        onClose={onProjectModalClose}
        onSubmit={onProjectModalSubmit}
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
    </Container>
  );
};

export default Projects;
