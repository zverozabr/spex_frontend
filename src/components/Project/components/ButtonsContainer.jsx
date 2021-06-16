import styled from 'styled-components';
import Button from '+components/Button';


export default styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;

  ${Button} + ${Button} {
    margin-left: 14px;
  }
`;
