import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

L.TileLayer.Omero = L.TileLayer.extend({
  options: {
    continuousWorld: true,
    tileCount: +process.env.TILE_COUNT || 8,
    updateWhenIdle: true,
    fitBounds: true,
    setMaxBounds: false,
    channels: [],
  },

  initialize(data, options) {
    options = typeof options !== 'undefined' ? options : {};

    if (options.maxZoom) {
      this._customMaxZoom = true;
    }

    if (options.channels.length) {
      //&c=1|40:6477$FF0000,2|907:7742$FFCC00,3|275:11648$FF0000,-4|398:4237$FFFFFF
      this._channels = options.channels
        .map((el, i) => {
          return `${el.active ? '' : '-'}${i + 1}|${el.window.start}:${el.window.end}$${el.color}`;
        })
        .join(',');
    }

    L.setOptions(this, options);

    this._baseUrl = this._templateUrl(options.baseUrl);
    this._getInfo(data);
  },

  _getInfo(data) {
    const _this = this;
    _this._id = data.id;
    _this.x = data.size.width;
    _this.y = data.size.height;

    if (data.tile_size) {
      _this.options.tileSize = L.point(data.tile_size.width, data.tile_size.height);
    } else {
      // Calc tile size
      let aspectRatio = _this.x >= _this.y ? _this.x / _this.y : _this.y / _this.x;
      let n = 0;

      if (_this.options.tileCount%2 === 0 && Math.trunc(aspectRatio)%2 === 0) {
        n = -1;
      }
      if (_this.options.tileCount%2 !== 0 && Math.trunc(aspectRatio)%2 !== 0) {
        n = 1;
      }

      const divider = (_this.options.tileCount + n) * aspectRatio;
      _this.options.tileSize = L.point(Math.round(_this.x / divider), Math.round(_this.y / divider));
    }

    const tierSizes = [];
    const imageSizes = [];
    let scale;
    let width_;
    let height_;
    let tilesX_;
    let tilesY_;

    const ceilLog2 = (x) => {
      return Math.ceil(Math.log(x) / Math.LN2);
    };

    // Calculates maximum native zoom for the layer
    _this.maxNativeZoom = Math.max(
      ceilLog2(_this.x / _this.options.tileSize.x),
      ceilLog2(_this.y / _this.options.tileSize.y),
      0,
    );

    _this.options.maxNativeZoom = _this.maxNativeZoom;

    // Enable zooming further than native if maxZoom option supplied
    if (
      _this._customMaxZoom &&
      _this.options.maxZoom > _this.maxNativeZoom
    ) {
      _this.maxZoom = _this.options.maxZoom;
    } else {
      _this.maxZoom = _this.maxNativeZoom;
    }

    for (let i = 0; i <= _this.maxZoom; i++) {
      scale = Math.pow(2, _this.maxNativeZoom - i);
      width_ = Math.ceil(_this.x / scale);
      height_ = Math.ceil(_this.y / scale);
      tilesX_ = Math.ceil(width_ / _this.options.tileSize.x);
      tilesY_ = Math.ceil(height_ / _this.options.tileSize.y);
      tierSizes.push([tilesX_, tilesY_]);
      imageSizes.push(L.point(width_, height_));
    }

    _this._tierSizes = tierSizes;
    _this._imageSizes = imageSizes;
  },

  _fitBounds() {
    const _this = this;

    // Find best zoom level and center map
    const initialZoom = _this._getInitialZoom(_this._map.getSize());
    const offset = _this._imageSizes.length - 1 - _this.options.maxNativeZoom;
    const imageSize = _this._imageSizes[initialZoom + offset];
    const sw = _this._map.options.crs.pointToLatLng(
      L.point(0, imageSize.y),
      initialZoom,
    );
    const ne = _this._map.options.crs.pointToLatLng(
      L.point(imageSize.x, 0),
      initialZoom,
    );
    const bounds = L.latLngBounds(sw, ne);

    _this._map.fitBounds(bounds, true);
  },

  _setMaxBounds() {
    const _this = this;

    // Find best zoom level, center map, and constrain viewer
    const initialZoom = _this._getInitialZoom(_this._map.getSize());
    const imageSize = _this._imageSizes[initialZoom];
    const sw = _this._map.options.crs.pointToLatLng(
      L.point(0, imageSize.y),
      initialZoom,
    );
    const ne = _this._map.options.crs.pointToLatLng(
      L.point(imageSize.x, 0),
      initialZoom,
    );
    const bounds = L.latLngBounds(sw, ne);

    _this._map.setMaxBounds(bounds, true);
  },

  _getInitialZoom(mapSize) {
    const _this = this;
    const tolerance = 0.8;
    let imageSize;
    // Calculate an offset between the zoom levels and the array accessors
    const offset = _this._imageSizes.length - 1 - _this.options.maxNativeZoom;
    for (let i = _this._imageSizes.length - 1; i >= 0; i--) {
      imageSize = _this._imageSizes[i];
      if (
        imageSize.x * tolerance < mapSize.x &&
        imageSize.y * tolerance < mapSize.y
      ) {
        return i - offset;
      }
    }
    // return a default zoom
    return 2;
  },

  onAdd(map) {
    const _this = this;

    // Store unmutated imageSizes
    _this._imageSizesOriginal = _this._imageSizes.slice(0);

    // Set maxZoom for map
    map._layersMaxZoom = _this.maxZoom;

    // Call add TileLayer
    L.TileLayer.prototype.onAdd.call(_this, map);

    // Set minZoom and minNativeZoom based on how the imageSizes match up
    let smallestImage = _this._imageSizes[0];
    const mapSize = _this._map.getSize();
    let newMinZoom = 0;
    // Loop back through 5 times to see if a better fit can be found.
    for (let i = 1; i <= 5; i++) {
      if (smallestImage.x > mapSize.x || smallestImage.y > mapSize.y) {
        smallestImage = smallestImage.divideBy(2);
        _this._imageSizes.unshift(smallestImage);
        newMinZoom = -i;
      } else {
        break;
      }
    }
    _this.options.minZoom = newMinZoom;
    _this.options.minNativeZoom = newMinZoom;
    _this._prev_map_layersMinZoom = _this._map._layersMinZoom;
    _this._map._layersMinZoom = newMinZoom;

    if (_this.options.fitBounds) {
      _this._fitBounds();
    }

    if (_this.options.setMaxBounds) {
      _this._setMaxBounds();
    }
  },

  onRemove(map) {
    const _this = this;

    map._layersMinZoom = _this._prev_map_layersMinZoom;
    _this._imageSizes = _this._imageSizesOriginal;

    // Remove maxBounds set for this image
    if (_this.options.setMaxBounds) {
      map.setMaxBounds(null);
    }

    // Call remove TileLayer
    if (_this._container) {
      L.TileLayer.prototype.onRemove.call(_this, map);
    }
  },

  _isValidTile(coords) {
    const _this = this;
    const zoom = _this._getZoomForUrl();
    const sizes = _this._tierSizes[zoom];
    const x = coords.x;
    const y = coords.y;

    if (zoom < 0 && x >= 0 && y >= 0) {
      return true;
    }

    if (!sizes) {
      return false;
    }

    return !(x < 0 || sizes[0] <= x || y < 0 || sizes[1] <= y);
  },

  _templateUrl(baseUrl) {
    return `${baseUrl}/{id}/0/0/?region={region}&q={q}&m=c${this._channels ? `&c=${this._channels}` : ''}`;
  },

  getTileUrl(coords) {
    const _this = this;
    const x = coords.x;
    const y = coords.y;
    const zoom = _this._getZoomForUrl();
    const scale = Math.pow(2, _this.maxNativeZoom - zoom);
    const tileBaseSizeX = _this.options.tileSize.x * scale;
    const tileBaseSizeY = _this.options.tileSize.y * scale;
    const minx = x * tileBaseSizeX;
    const miny = y * tileBaseSizeY;
    const maxx = Math.min(minx + tileBaseSizeX, _this.x);
    const maxy = Math.min(miny + tileBaseSizeY, _this.y);

    const xDiff = maxx - minx;
    const yDiff = maxy - miny;

    const quality = Math.min(1, Math.max(0.1, coords.z / 5));

    return L.Util.template(
      _this._baseUrl,
      L.extend(
        {
          id: _this._id,
          q: quality,
          region: [minx, miny, xDiff, yDiff].join(','),
        },
        _this.options,
      ),
    );
  },
});

const OmeroLayer = (props) => {
  const { data, options } = props;
  const map = useMap();

  useEffect(
    () => {
      if (!data) {
        return undefined;
      }

      const omeroLayer = new L.TileLayer.Omero(data, options);
      map.addLayer(omeroLayer);

      return () => {
        if (!map.hasLayer(omeroLayer)) {
          return;
        }
        map.removeLayer(omeroLayer);
      };
    },
    [map, data, options],
  );

  return null;
};

export default OmeroLayer;
