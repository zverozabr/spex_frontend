import React from 'react';
import PropTypes from 'prop-types';

/**
 * @see https://react-leaflet.js.org/docs/example-react-control
 */

const Positions = {
  bottomleft: 'bottomleft',
  bottomright: 'bottomright',
  topleft: 'topleft',
  topright: 'topright',
};

const PositionsClasses = {
  [Positions.bottomleft]: 'leaflet-bottom leaflet-left',
  [Positions.bottomright]: 'leaflet-bottom leaflet-right',
  [Positions.topleft]: 'leaflet-top leaflet-left',
  [Positions.topright]: 'leaflet-top leaflet-right',
};

const MapCustomControl = (props) => {
  const { position, containerProps, children } = props;
  return (
    <div className={PositionsClasses[position]}>
      <div className='leaflet-control leaflet-bar' {...containerProps}>
        {children}
      </div>
    </div>
  );
};

MapCustomControl.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
  containerProps: PropTypes.shape({}),
  position: PropTypes.oneOf(Object.values(Positions)),
};

MapCustomControl.defaultProps = {
  children: null,
  containerProps: {},
  position: Positions.bottomright,
};

export default MapCustomControl;
