/* eslint-disable react/jsx-no-literals, react/prop-types */
import React from 'react';
import classNames from 'classnames';

const ExpanderColumnHeader = ({ isAllRowsExpanded }) => (
  <div className={classNames('rt-expander', { '-open': isAllRowsExpanded })}>
    •
  </div>
);

export default ExpanderColumnHeader;
