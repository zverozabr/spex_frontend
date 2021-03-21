import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

import backendClient from '@/middleware/backendClient';

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

L.TileLayer.Omero = L.TileLayer.extend({
  options: {
    continuousWorld: true,
    tileSize: 128,
    updateWhenIdle: true,
    // tileFormat: 'jpg',
    fitBounds: true,
    setMaxBounds: false,
    channels: [],
  },

  initialize(data, options) {
    options = typeof options !== 'undefined' ? options : {};

    if (options.maxZoom) {
      this._customMaxZoom = true;
    }

    // // Check for explicit tileSize set
    // if (options.tileSize) {
    //   this._explicitTileSize = true;
    // }

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

  _templateUrl(baseUrl) {
    return `${baseUrl}/{id}/0/0/?region={region}&q={q}${this._channels ? `&c=${this._channels}` : ''}`;
  },

  _getInfo(data) {
    const _this = this;
    _this._id = data.id;
    _this.x = data.size.width;
    _this.y = data.size.height;
    if (data.tile_size) {
      _this.options.tileSize = data.tile_size.width;
    }

    const tierSizes = [];
    const imageSizes = [];
    let scale;
    let width_;
    let height_;
    let tilesX_;
    let tilesY_;

    // Unless an explicit tileSize is set, use a preferred tileSize
    // if (!_this._explicitTileSize) {
    //   // Set the default first
    //   _this.options.tileSize = 256;
    //   if (data.tiles) {
    //     // Image API 2.0 Case
    //     _this.options.tileSize = data.tiles[0].width;
    //   } else if (data.tile_width) {
    //     // Image API 1.1 Case
    //     _this.options.tileSize = data.tile_width;
    //   }
    // }

    const ceilLog2 = (x) => {
      return Math.ceil(Math.log(x) / Math.LN2);
    };

    // Calculates maximum native zoom for the layer
    _this.maxNativeZoom = Math.max(
      ceilLog2(_this.x / _this.options.tileSize),
      ceilLog2(_this.y / _this.options.tileSize),
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
      tilesX_ = Math.ceil(width_ / _this.options.tileSize);
      tilesY_ = Math.ceil(height_ / _this.options.tileSize);
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

    initApi();

    let normalNaturalWidth = 1;
    let normalNaturalHeight = 1;

    map.on('zoomstart', () => {
      normalNaturalWidth = 1;
      normalNaturalHeight = 1;
    });

    _this.on('tileloadstart', async ({ tile }) => {
      const tileUrl = tile.src;
      tile.src = '';
      tile.dataset.src = tileUrl;
      const { data } = await api.get(tileUrl, {
        responseType: 'arraybuffer',
      });
      tile.src = `data:image;base64,${Buffer.from(data, 'binary').toString('base64')}`;
      const { naturalWidth, naturalHeight } = tile;
      normalNaturalWidth = Math.max(normalNaturalWidth, naturalWidth);
      normalNaturalHeight = Math.max(normalNaturalHeight, naturalHeight);
    });

    _this.on('tileload', (data) => {
      const { tile } = data;
      const { naturalWidth, naturalHeight } = tile;
      const { width, height } = tile.style;

      normalNaturalWidth = Math.max(normalNaturalWidth, naturalWidth);
      normalNaturalHeight = Math.max(normalNaturalHeight, naturalHeight);

      if (naturalWidth === naturalHeight || width !== height) {
        return;
      }

      let scale = 1;
      let fixedWidth = parseInt(width, 10);
      let fixedHeight = parseInt(height, 10);

      if (naturalWidth > naturalHeight) {
        const d = naturalHeight / naturalWidth;
        fixedHeight = fixedHeight * d;

        if (naturalWidth < normalNaturalWidth) {
          scale = naturalWidth / normalNaturalWidth;
        }
      }

      if (naturalWidth < naturalHeight) {
        const d = naturalWidth / naturalHeight;
        fixedWidth = fixedWidth * d;

        if (naturalHeight < normalNaturalHeight) {
          scale = naturalHeight / normalNaturalHeight;
        }
      }

      tile.style.width = `${Math.round(fixedWidth * scale)}px`;
      tile.style.height = `${Math.round(fixedHeight * scale)}px`;
    });

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

  getTileUrl(coords) {
    const _this = this;
    const x = coords.x;
    const y = coords.y;
    const zoom = _this._getZoomForUrl();
    const scale = Math.pow(2, _this.maxNativeZoom - zoom);
    const tileBaseSize = _this.options.tileSize * scale;
    const minx = x * tileBaseSize;
    const miny = y * tileBaseSize;
    const maxx = Math.min(minx + tileBaseSize, _this.x);
    const maxy = Math.min(miny + tileBaseSize, _this.y);

    const xDiff = maxx - minx;
    const yDiff = maxy - miny;

    // Canonical URI Syntax for v2
    const size = Math.ceil(xDiff / scale) + ',';

    const quality = Math.min(1, Math.max(0.1, coords.z / 5));

    return L.Util.template(
      _this._baseUrl,
      L.extend(
        {
          id: _this._id,
          // format: _this.options.tileFormat,
          q: quality,
          region: [minx, miny, xDiff, yDiff].join(','),
          // rotation: 0,
          size: size,
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
