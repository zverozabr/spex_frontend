import styled from 'styled-components';
import { ScrollBarMixin } from '+components/ScrollBar';

export default styled.div`
  height: calc(100%);
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 40px 20px 20px 10px;
  
  ${ScrollBarMixin}
  
  div + div {
    margin-top: 20px;
  }
`;
