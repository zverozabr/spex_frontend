import Slider from '@material-ui/core/Slider';
import styled from 'styled-components';

export default styled(Slider).attrs((props) => ({
  value: props.input?.value || props.value || 0,
  onChange: props.input?.onChange || props.onChange,
}))`
  color: ${(props) => props.$color};
  .MuiSlider-valueLabel {
    text-shadow: 0 0 4px black;
  }
`;
