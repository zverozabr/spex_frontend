import React, { useMemo } from 'react';
import styled from 'styled-components';
import Table from '+components/Table';

export default styled((props) => {
  const { className, original: row } = props;
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
    }]),
    [],
  );

  return (
    <Table
      className={className}
      columns={columns}
      noDataText="No tasks found"
      data={row.tasks || []}
    />
  );
})`
  margin-left: 80px;
  width: calc(100% - 80px);
  
`;
