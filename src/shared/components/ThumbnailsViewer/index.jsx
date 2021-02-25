/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import styled from 'styled-components';

const ThumbnailsViewer = styled((props) => {
  const {
    className,
    thumbnails,
    active,
    size = 0.5,
    onClick,
  } = props;

  return (
    <GridList className={className} cellHeight={160} cols={3}>
      {Object.keys(thumbnails).map((id) => (
        <GridListTile
          key={id}
          className={`${active === id ? 'active' : ''}`}
          cols={size}
          rows={size}
          onClick={() => onClick(id)}
        >
          <img src={thumbnails[id]} alt={id} />
        </GridListTile>
      ))}
    </GridList>
  );
})`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  overflow: hidden;

  .MuiGridListTile-root {
    border: 2px solid transparent;
    &.active {
      border-color: red;
    }    
  }
  
  .MuiGridListTile-tile {
    cursor: pointer;
  }
`;

export default ThumbnailsViewer;
