import styled from 'styled-components';
import { ScrollBarMixin } from '+components/ScrollBar';

export default styled.div`
  width: 100%;
  min-height: 110px;
  height: 15%;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
  border-radius: 4px;
  margin-top: 14px;
  display: flex;
  overflow-y: auto;

  ${ScrollBarMixin};
`;
