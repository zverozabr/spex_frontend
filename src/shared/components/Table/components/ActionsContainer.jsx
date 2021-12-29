import styled from 'styled-components';
import Button from '+components/Button';

export default styled.div `
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  padding: 14px;
  background: #E3E3E4;
  
  .selected-row-actions {
    margin-left: auto;
  }

  .clear-row-selection-action {
    white-space: nowrap;
  }
  
  ${Button} + ${Button} {
    margin-left: 14px;
  }
  
  :empty {
    display: none;
  }
`;
