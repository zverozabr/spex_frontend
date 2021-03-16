import styled from 'styled-components';

export default styled.div`
  --width: ${(props) => props.$width};

  z-index: 9999;
  position: relative;
  top: 10px;
  left: 0;
  width: var(--width);
  height: calc(100% - 10px);
  padding: 20px;

  background-color: #ccc;
  cursor: default;
  
  transition: transform 0.3s;
  transform: ${(props) => props.$collapsed ? 'translateX(calc(var(--width) * -1))' : 'translateX(0)'};
  
  .mdi-icon {
    transition: transform 0.3s;
    transform: ${(props) => props.$collapsed ? 'scaleX(1)' : 'scaleX(-1)'};    
  }
`;
