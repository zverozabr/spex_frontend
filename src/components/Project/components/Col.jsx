import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: ${(props) => props.$width || '100%'};
  max-width: ${(props) => props.$maxWidth};
  min-height: 100%;

  > div + div {
    margin-top: 14px;
  }
`;
