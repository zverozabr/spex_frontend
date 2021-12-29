import classNames from 'classnames';
import styled from 'styled-components';

export default styled.div.attrs((props) => ({
  className: classNames('modal-content', props.className || ''),
}))`
  display: flex;
  flex-direction: column;
  min-width: 560px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 4px;
  overflow: hidden;
  outline: 0;
`;
