import classNames from 'classnames';
import styled from 'styled-components';

export default styled.div.attrs((props) => ({
  className: classNames('modal-content', props.className || ''),
}))`
  display: flex;
  flex-direction: column;
  width: 560px;
  max-height: 100%;
  border-radius: 4px;
  overflow: hidden;
  outline: 0;
`;
