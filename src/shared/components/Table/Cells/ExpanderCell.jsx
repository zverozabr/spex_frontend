/* eslint-disable react/jsx-no-literals, react/prop-types */
import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

const ExpanderCell = styled(({ className, row: { isExpanded } }) => (
  <div className={classNames(className, 'rt-expander', { 'open': isExpanded })}>
    •
  </div>
)) `
  display: inline-block;
  position: relative;
  color: transparent !important;
  width: 100%;
  text-align: center;

  :after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    top: 50%;
    left: 50%;
    border-top: 5.04px solid transparent;
    border-bottom: 5.04px solid transparent;
    border-left: 7px solid dimgray;
    transition: all .3s cubic-bezier(.175, .885, .32, 1.275);
    cursor: pointer;

    transform: translate(-50%, -50%) rotate(0);
  }

  &.open:after {
    transform: translate(-50%, -50%) rotate(90deg);
  }
`;

export default ExpanderCell;
