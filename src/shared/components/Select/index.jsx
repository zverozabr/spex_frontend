import MenuItemOrigin from '@material-ui/core/MenuItem';
import SelectOrigin from '@material-ui/core/Select';
import styled from 'styled-components';

const Select = styled(SelectOrigin)`
  width: 100%;
  color: white;
`;

const Option = styled(MenuItemOrigin)`
`;

export {
  Select as default,
  Option,
};
