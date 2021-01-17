import React, { Fragment } from 'react';
import Progress from '@/components/Progress';
import Body from './components/Body';

const Index = () => (
  <Fragment>
    <Progress />
    <Body>
      <div
        style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
        }}
      >
        Hello, Genentech
      </div>
    </Body>
  </Fragment>
);

export default Index;
