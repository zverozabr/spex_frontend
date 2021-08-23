import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 90%;
  
  .react-flow {
    width: 30%;
    height: 100%;
    
    .react-flow__node {
      cursor: pointer;
    }

    .react-flow__node.selected {
      background-color: rgba(0,0,0,0.25);
    }

    .react-flow__node-input {
      width: unset;
    }

    .react-flow__edge {
      pointer-events: none;
    }
  }
`;
