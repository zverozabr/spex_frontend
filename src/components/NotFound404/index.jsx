import React from 'react';
import { Link } from 'react-router-dom';

import Button from '+components/Button';
import Container from './components/Container';

const NotFound404 = () => (
  <Container>
    <h3>OOPS, looks like we lost you somewhere.</h3>
    <Link to="/"><Button>Go home</Button></Link>
  </Container>
);

export default NotFound404;
