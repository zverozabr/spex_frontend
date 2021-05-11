import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  box-sizing: border-box;
  overflow: hidden;
  
  > div + div {
    margin-top: 32px;
  }
`;
