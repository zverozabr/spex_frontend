import classNames from 'classnames';
import styled from 'styled-components';

export default styled.div.attrs((props) => ({
  className: classNames('modal-header', props.className || ''),
}))`
  display: flex;
  align-items: center;
  
  width: 100%;
  padding: 0 15px;
  background-color: #3f51b5;
  color: white;
  text-transform: capitalize;
  height: 40px;
  min-height: 40px;
`;
