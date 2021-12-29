import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin: 0 15px;
  
  min-width: 50px;
  max-width: 50px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
`;
