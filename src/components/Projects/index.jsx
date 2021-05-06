import React, { useState, useMemo, useCallback } from 'react';

import Button, { ButtonColors } from '+components/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';
import Table from '+components/Table';

import Container from './components/Container';

const columns = [
  {
    id: 'name',
    accessor: 'name',
    Header: 'Name',
  }, {
    id: 'description',
    accessor: 'description',
    Header: 'Description',
  },
];

const data = [
  { id: 1, name: 'Project 1', description: 'Some description 1' },
  { id: 2, name: 'Project 2', description: 'Some description 2' },
  { id: 3, name: 'Project 3', description: 'Some description 3' },
];

const Projects = () => {
  const [ addProjectModalOpen, setAddProjectModalOpen ] = useState(false);

  const onProjectModalOpen = useCallback(
    () => { setAddProjectModalOpen(true); },
    [],
  );

  const onProjectModalClose = useCallback(
    () => { setAddProjectModalOpen(false); },
    [],
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

  return (
    <Container>
      <Table
        actions={actions}
        columns={columns}
        data={data}
        allowRowSelection
      />
      <Modal
        open={addProjectModalOpen}
        onClose={onProjectModalClose}
      >
        <ModalHeader>Add Project</ModalHeader>
        <ModalBody>Project fields</ModalBody>
        <ModalFooter>
          <Button
            color={ButtonColors.secondary}
            onClick={onProjectModalClose}
          >
            Chancel
          </Button>
          <Button
            color={ButtonColors.primary}
            onClick={onProjectModalClose}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Projects;
