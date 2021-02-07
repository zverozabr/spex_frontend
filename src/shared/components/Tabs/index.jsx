/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import styled from 'styled-components';

const TabPanel = styled((props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
})`
  padding: 10px;
  overflow: hidden;
`;

export {
  Tabs as default,
  Tab,
  TabPanel,
};
