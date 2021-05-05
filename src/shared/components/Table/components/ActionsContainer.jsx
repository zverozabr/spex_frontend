import styled from 'styled-components';

export default styled.div `
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  overflow: hidden;
  align-items: center;
  height: 3.188em;
  padding: 0 .625em;
  background: #E3E3E4;
  
  .selected-row-actions {
    margin-left: auto;
  }

  .clear-row-selection-action {
    white-space: nowrap;
  }
  
  .row-size-actions {
    margin-left: auto;
    .normal svg {
      transform: scale(1, .9);
    }
    .double svg {
      transform: scale(1, 1.2);
    }
  }
  
  .button-group-container + .row-size-actions {
    margin-left: 1.250em;
  }
`;
