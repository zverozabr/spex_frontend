import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';

export default styled(Checkbox)`
  &.MuiCheckbox-root {
    padding: 0;
  }

  .MuiIconButton-label {
    color: ${(props) => props.$color};
  }
`;
