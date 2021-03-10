import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, ZoomControl } from 'react-leaflet';
import styled from 'styled-components';

import FullscreenImg from '@/assets/leaflet/fullscreen.png';
import FullscreenImg2x from '@/assets/leaflet/fullscreen@2x.png';
import ResetZoom from '@/assets/leaflet/resetzoom.png';

import FullscreenControl from './components/FullscreenControl';
import OmeroLayer from './components/OmeroLayer';
import ResetZoomControl from './components/ResetZoomControl';


const baseUrl = 'http://idr.openmicroscopy.org/webgateway/render_image_region/';

const ImageViewer = styled((props) => {
  const { className, data } = props;

  return (
    <MapContainer
      className={className}
      crs={L.CRS.Simple}
      center={[0, 0]}
      minZoom={1}
      maxZoom={10}
      zoom={1}
      attributionControl={false}
      zoomControl={false}
    >
      <OmeroLayer
        data={data}
        options={{
          baseUrl,
          tileSize: 128,
        }}
      />
      <ZoomControl position="bottomright" />
      <ResetZoomControl position="bottomright" />
      <FullscreenControl position="topright" />
    </MapContainer>
  );
})`
  height: 100%;
  width: 100%;

  // Fullscreen
  .leaflet-control-fullscreen a {
    background: #fff url(${FullscreenImg}) no-repeat 0 0;
    background-size: 26px 52px;
  }
  &.leaflet-touch .leaflet-control-fullscreen a {
    background-position: 2px 2px;
  }
  &.leaflet-fullscreen-on .leaflet-control-fullscreen a {
    background-position: 0 -26px;
  }
  &.leaflet-touch.leaflet-fullscreen-on .leaflet-control-fullscreen a {
    background-position: 2px -24px;
  }

  /* Do not combine these two rules; IE will break. */
  &.leaflet-container:-webkit-full-screen {
    width: 100% !important;
    height: 100% !important;
  }
  &.leaflet-container.leaflet-fullscreen-on {
    width: 100% !important;
    height: 100% !important;
  }

  &.leaflet-pseudo-fullscreen {
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

export default ImageViewer;
