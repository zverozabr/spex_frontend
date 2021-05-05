/* eslint-disable react/jsx-no-literals, react/prop-types */
import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

const ExpanderCell = styled(({ className, row: { isExpanded, subRows } }) => subRows?.length > 1 && (
  <div className={classNames(className, 'rt-expander', { '-open': isExpanded })}>
    •
  </div>
)) `
  margin: 0 .563em;
`;

export default ExpanderCell;
