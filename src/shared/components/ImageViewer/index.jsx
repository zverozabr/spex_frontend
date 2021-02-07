import ImageViewer from 'react-viewer';
import styled from 'styled-components';

export default styled(ImageViewer)`
  [data-key="prev"],
  [data-key="next"] {
    display: none;
  }

  .react-viewer-mask {
    background-color: #ccc;
  }
`;

