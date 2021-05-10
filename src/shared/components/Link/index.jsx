import LinkOrigin from '@material-ui/core/Link';
import styled from 'styled-components';

const Link = styled(LinkOrigin).attrs((props) => ({
  href: props.to,
  color: props.color || 'inherit',
}))`

`;

export default Link;
