import styled from 'styled-components';

export default styled.div`
  width: 100%;
  height: 70%;
  
  .react-flow__node {
    cursor: pointer;
  }
  
  .react-flow__node-input {
    width: unset;
  }

  .react-flow__edge {
    pointer-events: none;
  }
`;
