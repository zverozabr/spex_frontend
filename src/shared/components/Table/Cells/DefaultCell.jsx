import React from 'react';
import styled from 'styled-components';

const DefaultCell = styled(({ className, value }) => (
  <div className={`${className} cell-container`}>
    {String(value ?? '')}
  </div>
)) `
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0 .563em;
`;

export default DefaultCell;
