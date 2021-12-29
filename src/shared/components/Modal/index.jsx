import React from 'react';
import ModalOrigin from '@material-ui/core/Modal';
import styled from 'styled-components';

import ModalBody from './components/Body';
import Content from './components/Content';
import ModalFooter from './components/Footer';
import ModalHeader from './components/Header';

const Modal = styled(({ className, children, ...tail }) => (
  <ModalOrigin {...tail} className={className}>
    <Content>{children}</Content>
  </ModalOrigin>
))`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export {
  Modal as default,
  ModalHeader,
  ModalBody,
  ModalFooter,
};
