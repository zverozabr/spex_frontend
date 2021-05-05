import React from 'react';

import { ButtonColors } from '+components/Button';
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
  const actions = [
    {
      name: 'Delete Selected',
      // eslint-disable-next-line no-console
      fn: (rows) => console.log('delete', rows),
      color: ButtonColors.danger,
      enabledOnlyWhenSelectedRows: true,
    },
    {
      name: 'Add Project',
      // eslint-disable-next-line no-console
      fn: (rows) => console.log('add', rows),
      color: ButtonColors.primary,
    },
  ];

  return (
    <Container>
      <Table
        actions={actions}
        columns={columns}
        data={data}
        allowRowSelection
      />
    </Container>
  );
};

export default Projects;
