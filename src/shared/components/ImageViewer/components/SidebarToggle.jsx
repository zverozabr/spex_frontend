import styled from 'styled-components';

export default styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 30px;
  
  transform: translateX(100%);
  background-color: #ccc;
  cursor: pointer;

  box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.25);
`;
