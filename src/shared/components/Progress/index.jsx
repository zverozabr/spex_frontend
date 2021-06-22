import React from 'react';
import LinearProgressOrigin from '@material-ui/core/LinearProgress';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const LinearProgress = styled(LinearProgressOrigin)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 2px;
`;

// const normalize = ({ value, min = 0, max = 100 }) => (value - min) * 100 / (max - min);
const makeIsFetchingArr = (obj) => Object.values(obj).reduce((acc, el) => ('isFetching' in el) ? [...acc, el.isFetching ] : acc, []);

const Progress = () => {
  const allFetching = useSelector(makeIsFetchingArr);
  const isFetching = allFetching.filter(Boolean);
  // const value = normalize({ value: isFetching.length, min: 0, max: allFetching.length });
  // const valueBuffer = normalize({ value: isFetching.length, min: 0, max: allFetching.length });
  return isFetching.length === 0 ? null : <LinearProgress color="secondary" />;
};

export default Progress;
