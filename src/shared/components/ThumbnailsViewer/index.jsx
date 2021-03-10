/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import styled from 'styled-components';

const ThumbnailsViewer = styled((props) => {
  const {
    className,
    thumbnails = [],
    active,
    size = 0.5,
    onClick,
  } = props;

  return (
    <GridList className={className} cellHeight={160} cols={3}>
      {thumbnails.map((thumbnail) => (
        <GridListTile
          key={thumbnail.id}
          className={`${active === thumbnail.id ? 'active' : ''}`}
          cols={size}
          rows={size}
          onClick={() => onClick(thumbnail.id)}
        >
          <img src={thumbnail.img} alt={thumbnail.title} />
          <GridListTileBar
            title={thumbnail.title}
            subtitle={thumbnail.author ? (<span>by: {thumbnail.author}</span>) : undefined}
          />
        </GridListTile>
      ))}
    </GridList>
  );
})`
  .MuiGridListTile-root {
    border: 0.125em solid transparent;
    &.active {
      border-color: red;
    }

    .MuiGridListTile-tile {
      cursor: pointer;
    }
  }

  .MuiGridListTileBar-root {
    height: 30%;
    background-color: rgba(255, 255, 255, 0.24);

    .MuiGridListTileBar-titleWrap {
      margin: 0 0.188em;
    }

    .MuiGridListTileBar-title {
      font-size: 0.563em;
    }
  }
`;

export default ThumbnailsViewer;
