import classNames from 'classnames';
import styled from 'styled-components';

export default styled.div.attrs((props) => ({
  className: classNames('modal-footer', props.className || ''),
}))`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  padding: 0 15px;
  background-color: white;
  height: 60px;
  
  .MuiButton-root + .MuiButton-root {
    margin-left: 15px;
  }
`;
