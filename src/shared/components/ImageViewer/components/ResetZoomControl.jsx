import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

L.Control.ResetZoom = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd(map) {
    this._map = map;

    const container = L.DomUtil.create('div', 'leaflet-control-resetzoom leaflet-bar leaflet-control');

    const link = L.DomUtil.create('a', 'leaflet-control-resetzoom-button leaflet-bar-part', container);
    link.title = 'Reset Zoom';
    link.href = '#';

    L.DomEvent.on(link, 'click', this._click, this);
    L.DomEvent.on(link, 'dblclick', this._noop, this);
    L.DomEvent.on(link, 'mousedown ', this._noop, this);
    L.DomEvent.on(link, 'touchstart ', this._noop, this);

    return container;
  },

  _click: function (e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    this._map.setView(this._map.getCenter(), this._map.options.zoom);
  },

  _noop: function (e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
  },
});

const FullscreenControl = (props) => {
  const { position } = props;
  const map = useMap();

  useEffect(
    () => {
      const options = { position };
      const resetZoomControl = new L.Control.ResetZoom(options);
      map.addControl(resetZoomControl);
    },
    [map, position],
  );

  return null;
};

export default FullscreenControl;
