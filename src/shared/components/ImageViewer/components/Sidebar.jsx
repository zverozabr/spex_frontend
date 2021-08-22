import styled from 'styled-components';

export default styled.div`
  --width: ${(props) => props.$width};

  z-index: 999;
  position: absolute;
  top: 0;
  left: 0;
  width: var(--width);
  height: 100%;

  background-color: #ccc;
  cursor: default;
  
  transition: transform 0.3s;
  transform: ${(props) => props.$collapsed ? 'translateX(calc(var(--width) * -1 - 2px))' : 'translateX(0)'};
  
  box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.25);
  .mdi-icon {
    transition: transform 0.3s;
    transform: ${(props) => props.$collapsed ? 'scaleX(1)' : 'scaleX(-1)'};    
  }
`;
