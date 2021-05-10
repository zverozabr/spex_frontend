import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';

import Container from './components/Container';

const AnalysisPage = () => {
  const location = useLocation();

  const { projectId } = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      const projectId = pathArray[1] === PathNames.project && pathArray[2] ? `${pathArray[2]}` : undefined;
      return { projectId };
    },
    [location.pathname],
  );

  return (
    <Container>
      {projectId}
    </Container>
  );
};

export default AnalysisPage;
