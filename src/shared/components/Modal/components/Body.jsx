import classNames from 'classnames';
import styled from 'styled-components';

import { ScrollBarMixin } from '+components/ScrollBar';

export default styled.div.attrs((props) => ({
  className: classNames('modal-body', props.className || ''),
}))`
  display: flex;
  flex-direction: column;

  width: 100%;
  padding: 10px 15px;
  background-color: white;

  overflow-y: auto;
  ${ScrollBarMixin};
`;
