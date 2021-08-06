import styled from 'styled-components';

export default styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 24px * 2);
  
  .pipeline-add-block {
    z-index: 999;
    position: absolute;
    white-space: nowrap;
  }
`;
