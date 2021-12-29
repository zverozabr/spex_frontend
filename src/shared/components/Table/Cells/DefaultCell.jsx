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
`;

export default DefaultCell;
