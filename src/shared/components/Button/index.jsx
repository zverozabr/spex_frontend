import ButtonOrigin from '@material-ui/core/Button';
import styled from 'styled-components';

const ButtonColors = {
  primary: 'primary',
  secondary: 'default',
  danger: 'secondary',
  tertiary: 'tertiary',
  link: 'link',
};

const Button = styled(ButtonOrigin).attrs((props) => ({
  variant: props.variant || 'contained',
  color: props.color || ButtonColors.primary,
}))`

`;

export {
  Button as default,
  ButtonColors,
};
