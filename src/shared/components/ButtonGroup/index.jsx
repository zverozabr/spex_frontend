import ButtonGroupOrigin from '@material-ui/core/ButtonGroup';
import styled from 'styled-components';

const ButtonGroup = styled(ButtonGroupOrigin).attrs((props) => ({
  variant: props.variant || 'contained',
}))`

`;

export default ButtonGroup;
