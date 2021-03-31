import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import SideBarToggleIcon from 'mdi-react/MenuRightIcon';
import PropTypes from 'prop-types';
import { MapContainer, ZoomControl, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useToggle } from 'react-use';

import Checkbox from '+components/Checkbox';
import Slider from '+components/Slider';

import Channel from './components/Channel';
import ChannelLabel from './components/ChannelLabel';
import Channels from './components/Channels';
import Container from './components/Container';
import FullscreenControl from './components/FullscreenControl';
import OmeroLayer from './components/OmeroLayer';
import ResetZoomControl from './components/ResetZoomControl';
import SideBar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';

const {
  REACT_APP_BACKEND_URL_ROOT,
} = process.env;

const baseUrl = `${REACT_APP_BACKEND_URL_ROOT}/omero/webgateway/render_image_region`;

const ImageViewer = (props) => {
  const { className, data } = props;

  const [map, setMap] = useState(null);
  const [channels, setChannels] = useState(cloneDeep(data.channels));
  const [sidebarCollapsed, toggleSidebar] = useToggle(true);
  const [pathCreated, togglePath] = useToggle(false);

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

  const onCreatePath = useCallback(
    (event) => {
      const [ latLngs ] = event.layer.getLatLngs();
      const { sourceTarget: _map } = event;
      const p1 = _map.options.crs.latLngToPoint(latLngs[1]);
      const p2 = _map.options.crs.latLngToPoint(latLngs[3]);
      const region = [Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y)];
      // eslint-disable-next-line no-console
      console.log('region:', region.join(', '));
      togglePath();
    },
    [togglePath],
  );

  const onEditPath = useCallback(
    (event) => {
      const [ latLngs ] = event.layer.getLatLngs();
      const { sourceTarget: _map } = event;
      const p1 = _map.options.crs.latLngToPoint(latLngs[1]);
      const p2 = _map.options.crs.latLngToPoint(latLngs[3]);
      const region = [Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y)];
      // eslint-disable-next-line no-console
      console.log('region:', region.join(', '));
    },
    [],
  );

  const onDeletedPath = useCallback(
    () => {
      // eslint-disable-next-line no-console
      console.log('path deleted');
      togglePath();
    },
    [togglePath],
  );

  useEffect(
    () => {
      L.EditToolbar.Delete.include({
        enable: function () {
          // eslint-disable-next-line react/no-this-in-sfc
          this.options.featureGroup.clearLayers();
          onDeletedPath();
        },
      });
    },
    [onDeletedPath, togglePath],
  );

  return (
    <Container className={classNames(className, { pathCreated })}>
      <MapContainer
        crs={L.CRS.Simple}
        center={[0, 0]}
        minZoom={0}
        maxZoom={5}
        zoom={0}
        attributionControl={false}
        zoomControl={false}
        whenCreated={setMap}
      >
        <OmeroLayer
          data={data}
          options={{
            baseUrl,
            channels,
          }}
        />

        <FullscreenControl position="topright" />

        <FeatureGroup>
          <EditControl
            position="topright"
            onEdited={onEditPath}
            onCreated={onCreatePath}
            onDeleted={onDeletedPath}
            draw={{
              // see: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#drawoptions
              polyline: false,
              polygon: false,
              rectangle: true,
              circle: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>

        <ZoomControl position="bottomright" />
        <ResetZoomControl position="bottomright" />
      </MapContainer>

      <SideBar
        $width="300px"
        $collapsed={sidebarCollapsed}
        onMouseEnter={onSidebarMouseEnter}
        onMouseLeave={onSidebarMouseLeave}
      >
        <SidebarToggle
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
    </Container>
  );
};

ImageViewer.propTypes = {
  className: PropTypes.string,
  data: PropTypes.shape({
    channels: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

ImageViewer.defaultProps = {
  className: '',
  data: {},
};

export default ImageViewer;
