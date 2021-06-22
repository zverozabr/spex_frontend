import classNames from 'classnames';
import styled from 'styled-components';

export default styled.div.attrs((props) => ({
  className: classNames('modal-content', props.className || ''),
}))`
  display: flex;
  flex-direction: column;
  width: 560px;
  border-radius: 4px;
  overflow: hidden;
  outline: 0;
`;
