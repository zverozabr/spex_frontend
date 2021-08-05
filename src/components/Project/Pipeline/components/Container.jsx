import styled from 'styled-components';

export default styled.div`
  display: flex;
  height: calc(100vh - 64px - 24px * 2);
  
  > div + div {
    margin-left: 16px;
  }
`;
