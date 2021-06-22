import styled from 'styled-components';

export default styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  
  > div {
    margin-top: unset !important;
    width: 100%;
  }
  
  > div:not(:last-child) {
    margin-right: 7px !important;
  }
  
  > div + div {
    margin-left: 7px !important;
  }
`;
