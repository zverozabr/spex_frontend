import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer } from 'react-leaflet';
import styled from 'styled-components';

import OmeroLayer from './components/OmeroLayer';

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
      zoom={2}
      attributionControl={false}
    >
      <OmeroLayer
        data={data}
        options={{
          baseUrl,
          tileSize: 128,
        }}
      />
    </MapContainer>
  );
})`
  height: 100%;
  width: 100%;
`;

export default ImageViewer;
