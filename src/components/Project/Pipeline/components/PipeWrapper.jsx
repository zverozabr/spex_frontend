import styled from 'styled-components';

export default styled.div`
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  > div + div {
    margin-top: 16px;
  }
`;
