import LinkOrigin from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';

const Link = styled(LinkOrigin).attrs((props) => ({
  href: props.to,
  color: props.color || 'inherit',
  component: props.component || RouterLink,
}))`

`;

export default Link;
