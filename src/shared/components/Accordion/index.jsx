/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import AccordionOrigin from '@material-ui/core/Accordion';
import AccordionDetailsOrigin from '@material-ui/core/AccordionDetails';
import AccordionSummaryOrigin from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from 'mdi-react/ChevronDownIcon';
import styled from 'styled-components';

import Typography from '+components/Typography';

const Accordion = styled((props) => {
  const { children, ...other } = props;
  return (
    <AccordionOrigin {...other} square>
      {children}
    </AccordionOrigin>
  );
})`
`;

const AccordionSummary = styled((props) => {
  const { children, ...other } = props;
  return (
    <AccordionSummaryOrigin {...other} expandIcon={<ExpandMoreIcon />}>
      <Typography>{children}</Typography>
    </AccordionSummaryOrigin>
  );
})`
`;

const AccordionDetails = styled((props) => {
  const { children, ...other } = props;
  return (
    <AccordionDetailsOrigin {...other}>
      <div>
        {children}
      </div>
    </AccordionDetailsOrigin>
  );
})`
`;

export {
  Accordion as default,
  AccordionSummary,
  AccordionDetails,
};
