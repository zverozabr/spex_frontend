import ButtonOrigin from '@material-ui/core/Button';
import styled from 'styled-components';

const ButtonSizes = {
  large: 'large',
  medium: 'medium',
  small: 'small',
};

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
  size: props.size || ButtonSizes.medium,
}))`

`;

export {
  Button as default,
  ButtonSizes,
  ButtonColors,
};
