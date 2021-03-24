import styled from 'styled-components';

import FullscreenImg from '@/assets/leaflet/fullscreen.png';
import FullscreenImg2x from '@/assets/leaflet/fullscreen@2x.png';
import ResetZoom from '@/assets/leaflet/resetzoom.png';

export default styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  .leaflet-container {
    width: 100%;
    height: 100%;
  }

  // Fullscreen
  .leaflet-control-fullscreen a {
    background: #fff url(${FullscreenImg}) no-repeat 0 0;
    background-size: 26px 52px;
  }
  .leaflet-touch .leaflet-control-fullscreen a {
    background-position: 2px 2px;
  }
  .leaflet-fullscreen-on .leaflet-control-fullscreen a {
    background-position: 0 -26px;
  }
  .leaflet-touch.leaflet-fullscreen-on .leaflet-control-fullscreen a {
    background-position: 2px -24px;
  }

  /* Do not combine these two rules; IE will break. */
  .leaflet-container:-webkit-full-screen {
    width: 100% !important;
    height: 100% !important;
  }
  .leaflet-container.leaflet-fullscreen-on {
    width: 100% !important;
    height: 100% !important;
  }

  .leaflet-pseudo-fullscreen {
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 99999;
  }

  @media (-webkit-min-device-pixel-ratio:2), (min-resolution:192dpi) {
    .leaflet-control-fullscreen a {
      background-image: url(${FullscreenImg2x});
    }
  }

  // Reset Zoom
  .leaflet-control-resetzoom a {
    background: #fff url(${ResetZoom}) no-repeat 6px 6px;
    background-size: 18px 18px;
  }
`;
