import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PathNames from '@/models/PathNames';

import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';

import { ButtonColors } from '+components/Button';
import { Field, Controls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import Link from '+components/Link';
import Table from '+components/Table';

import Container from './components/Container';

const columns = [{
  id: 'name',
  accessor: 'name',
  Header: 'Name',
  Cell: ({ row: { original: { id, name } } }) => useMemo(
    () => (
      <Link to={`/${PathNames.project}/${id}`}>
        {name}
      </Link>
    ),
    [id, name],
  ),
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

  const onProjectAdd = useCallback(
    (newProject) => {
      dispatch(projectsActions.createProject(newProject));
      setAddProjectModalOpen(false);
    },
    [dispatch],
  );

  const onProjectsDelete = useCallback(
    (projectsToDelete) => {
      projectsToDelete.forEach((el) => dispatch(projectsActions.deleteProject(el.id)));
    },
    [dispatch],
  );

  const actions = useMemo(
    () => ([{
      name: 'Delete Selected',
      fn: onProjectsDelete,
      color: ButtonColors.danger,
      enabledOnlyWhenSelectedRows: true,
    }, {
      name: 'Add Project',
      fn: onProjectModalOpen,
      color: ButtonColors.primary,
    }]),
    [onProjectModalOpen, onProjectsDelete],
  );

  return (
    <Container>
      <Table
        actions={actions}
        columns={columns}
        data={Object.values(projects)}
        allowRowSelection
      />

      {addProjectModalOpen && (
        <FormModal
          header="Add Project"
          open={addProjectModalOpen}
          onClose={onProjectModalClose}
          onSubmit={onProjectAdd}
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
    </Container>
  );
};

export default Projects;
