import React, { Fragment, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import Button, { ButtonSizes, ButtonColors } from '+components/Button';
import Table, { ButtonsCell } from '+components/Table';

import TaskFormModal from './TaskFormModal';

export default styled((props) => {
  const { className, original: row } = props;

  const [ taskToManage, setTaskToManage ] = useState(null);

  const onManageTaskModalOpen = useCallback(
    (task) => { setTaskToManage(task); },
    [],
  );

  const onManageTaskModalClose = useCallback(
    () => { setTaskToManage(null); },
    [],
  );

  const columns = useMemo(
    () => ([{
      id: 'status',
      accessor: 'status',
      Header: 'Status',
      Cell: ({ row: { original: { status } } }) => useMemo(
        () => {
          if (status == null) {
            return 'N/A';
          }
          if (Math.round(status) === 0) {
            return 'Waiting To Process';
          }
          if (Math.round(status) === 100) {
            return 'Done';
          }
          return 'In Progress';
        },
        [status],
      ),
    }, {
      id: 'omeroId',
      accessor: 'omeroId',
      Header: 'Omero Image ID',
    }, {
      id: 'csvdata',
      accessor: 'csvdata',
      Header: 'CSV Data',
    }, {
      id: 'actions',
      Header: 'Actions',
      minWidth: 50,
      maxWidth: 50,
      Cell: ({ row: { original } }) => useMemo(
        () => (
          <ButtonsCell>
            <Button
              size={ButtonSizes.small}
              color={ButtonColors.secondary}
              variant="outlined"
              onClick={() => onManageTaskModalOpen(original)}
            >
              Results
            </Button>
          </ButtonsCell>
        ),
        [original],
      ),
    }]),
    [onManageTaskModalOpen],
  );

  return (
    <Fragment>
      <Table
        className={className}
        columns={columns}
        noDataText="No tasks found"
        data={row.tasks || []}
      />

      {taskToManage && (
        <TaskFormModal
          header="Task Results"
          initialValues={taskToManage}
          onClose={onManageTaskModalClose}
          onSubmit={onManageTaskModalClose}
          open
        />
      )}
    </Fragment>
  );
})`
  margin-left: 80px;
  width: calc(100% - 80px);
`;
