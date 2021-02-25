/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import styled from 'styled-components';

import { ScrollBarMixin } from '+components/ScrollBar';

const TabPanel = styled((props) => {
  const {
    className,
    children,
    value,
    index,
    ...other
  } = props;

  return (
    <div
      className={className}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
})`
  overflow: auto;
  height: 100%;
  
  ${ScrollBarMixin}
`;

export {
  Tabs as default,
  Tab,
  TabPanel,
};
