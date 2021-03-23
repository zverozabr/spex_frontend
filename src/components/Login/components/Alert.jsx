import { Alert } from '@material-ui/lab';
import styled from 'styled-components';

export default styled(Alert)`
  position: absolute;
  top: 0;
  transform: translateY(calc(-100% - 1em));
`;
