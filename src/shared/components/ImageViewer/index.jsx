/* eslint-disable react/jsx-sort-default-props */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import SideBarToggleIcon from 'mdi-react/MenuRightIcon';
import PropTypes from 'prop-types';
import { MapContainer, ZoomControl, FeatureGroup, Rectangle } from 'react-leaflet';
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
  const {
    className,
    data,
    value,
    editable,
    onChange,
  } = props;

  const [map, setMap] = useState(null);
  const featureGroup = useRef(null);

  const [channels, setChannels] = useState(cloneDeep(data.channels));
  const [sidebarCollapsed, toggleSidebar] = useToggle(true);
  const [rectangleBounds, setRectangleBounds] = useState(null);

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

  const onPathChange = useCallback(
    (_map, layer) => {
      if (onChange && _map && layer) {
        const [ latLngs ] = layer.getLatLngs();
        const p1 = _map.options.crs.latLngToPoint(latLngs[1]);
        const p2 = _map.options.crs.latLngToPoint(latLngs[3]);
        const region = [{
          x: Math.max(0, Math.round(p1.x)),
          y: Math.max(0, Math.round(p1.y)),
        }, {
          x: Math.max(0, Math.round(p2.x)),
          y: Math.max(0, Math.round(p2.y)),
        }];
        onChange(region);
      }
      featureGroup.current.clearLayers();
    },
    [onChange],
  );

  const onPathCreate = useCallback(
    (event) => {
      const { sourceTarget: _map } = event;
      const { layer } = event;
      onPathChange(_map, layer);
    },
    [onPathChange],
  );

  const onPathEdit = useCallback(
    (event) => {
      const { sourceTarget: _map } = event;
      const [ layer ] = event.layers.getLayers();
      onPathChange(_map, layer);
    },
    [onPathChange],
  );

  const onPathDeleted = useCallback(
    () => {
      onChange(null);
    },
    [onChange],
  );

  useEffect(
    () => {
      L.EditToolbar.Delete.include({
        enable: () => {
          // eslint-disable-next-line react/no-this-in-sfc
          featureGroup.current.clearLayers();
          onPathDeleted();
        },
      });
    },
    [onPathDeleted],
  );

  useEffect(
    () => {
      if (!map?.options?.crs) {
        return;
      }

      if (value?.filter((el) => el?.x >= 0 && el?.y >=0).length !== 2) {
        featureGroup.current.clearLayers();
        setRectangleBounds(null);
        return;
      }

      const p1 = L.point(value[0].x, value[0].y);
      const latlng1 = map.options.crs.pointToLatLng(p1);
      const p2 = L.point(value[1].x, value[1].y);
      const latlng2 = map.options.crs.pointToLatLng(p2);
      const bounds = [latlng1, latlng2];

      setRectangleBounds(bounds);
    },
    [map, value],
  );

  return (
    <Container className={classNames(className, { editable, 'with-rectangle': rectangleBounds })}>
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

        <FeatureGroup ref={featureGroup}>
          <EditControl
            position="topright"
            draw={{
              // see: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#drawoptions
              polyline: false,
              polygon: false,
              rectangle: true,
              circle: false,
              marker: false,
              circlemarker: false,
            }}
            edit={{ edit: true, remove: true }}
            onEdited={onPathEdit}
            onCreated={onPathCreate}
            onDeleted={onPathDeleted}
          />
          {rectangleBounds && <Rectangle bounds={rectangleBounds} />}
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
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Omero image data object
   */
  data: PropTypes.shape({
    channels: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  /**
   * Selected area value [{ x1, y1 }, { x2, y2 }]
   */
  value: PropTypes.arrayOf(PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })),
  /**
   * If true, edit controls will be displayed (selection of an area on the image).
   */
  editable: PropTypes.bool,
  /**
   * A callback fired when selected area changed.
   */
  onChange: PropTypes.func,
};

ImageViewer.defaultProps = {
  className: '',
  data: {},
  value: null,
  editable: false,
  onChange: null,
};

export default ImageViewer;
