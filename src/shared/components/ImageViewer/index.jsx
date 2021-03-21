import React, { useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import SideBarToggleIcon from 'mdi-react/MenuRightIcon';
import { MapContainer, ZoomControl } from 'react-leaflet';
import { useToggle } from 'react-use';
import styled from 'styled-components';

import FullscreenImg from '@/assets/leaflet/fullscreen.png';
import FullscreenImg2x from '@/assets/leaflet/fullscreen@2x.png';
import ResetZoom from '@/assets/leaflet/resetzoom.png';

import Checkbox from '+components/Checkbox';
import Slider from '+components/Slider';

import Channel from './components/Channel';
import ChannelLabel from './components/ChannelLabel';
import Channels from './components/Channels';
import FullscreenControl from './components/FullscreenControl';
import OmeroLayer from './components/OmeroLayer';
import ResetZoomControl from './components/ResetZoomControl';
import SideBar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';

const {
  REACT_APP_BACKEND_URL_ROOT,
} = process.env;

const baseUrl = `${REACT_APP_BACKEND_URL_ROOT}/omero/px/webgateway/render_image_region`;

const ImageViewer = styled((props) => {
  const { className, data } = props;

  const [map, setMap] = useState(null);
  const [channels, setChannels] = useState(cloneDeep(data.channels));
  const [sidebarCollapsed, toggleSidebar] = useToggle(true);

  const onSidebarMouseEnter = useCallback(
    () => {
      map.dragging.disable();
    },
    [map],
  );

  const onSidebarMouseLeave = useCallback(
    () => {
      map.dragging.enable();
    },
    [map],
  );

  const onChannelToggle = useCallback(
    (index) => (_, newValue) => {
      const channelsClone = channels.slice();
      channelsClone[index].active = newValue;
      setChannels(channelsClone);
    },
    [channels],
  );

  const onChannelRangeChange = useCallback(
    (index) => (_, newValue) => {
      const channelsClone = channels.slice();
      channelsClone[index].window.start = newValue[0];
      channelsClone[index].window.end = newValue[1];
      setChannels(channelsClone);
    },
    [channels],
  );

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
      whenCreated={setMap}
    >
      <OmeroLayer
        data={data}
        options={{
          baseUrl,
          // tileSize: 96,
          channels,
        }}
      />
      <ZoomControl position="bottomright" />
      <ResetZoomControl position="bottomright" />
      <FullscreenControl position="topright" />
      <SideBar
        $width="300px"
        $collapsed={sidebarCollapsed}
        onMouseEnter={onSidebarMouseEnter}
        onMouseLeave={onSidebarMouseLeave}
      >
        <SidebarToggle
          className="leaflet-control"
          type="button"
          onClick={toggleSidebar}
        >
          <SideBarToggleIcon />
        </SidebarToggle>

        <Channels>
          {channels.map((channel, index) => (
            <Channel key={channel.label}>
              <Checkbox
                $color={`#${channel.color}`}
                checked={channel.active}
                onChange={onChannelToggle(index)}
              />
              <ChannelLabel>{channel.label}</ChannelLabel>
              <Slider
                $color={`#${channel.color}`}
                min={channel.window.min}
                max={channel.window.max}
                value={[channel.window.start, channel.window.end]}
                onChange={onChannelRangeChange(index)}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                disabled={!channel.active}
              />
            </Channel>
          ))}
        </Channels>
      </SideBar>
    </MapContainer>
  );
})`
  position: relative;
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
