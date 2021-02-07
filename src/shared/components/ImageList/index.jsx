/* eslint-disable react/react-in-jsx-scope, react/prop-types */
import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import styled from 'styled-components';

const ImageList = styled(({ className, images, value, onClick }) => {
  return (
    <GridList className={className} cellHeight={160} cols={3}>
      {images.map((item) => (
        <GridListTile
          key={item.src}
          className={`${value === item.id ? 'active' : ''}`}
          cols={item.cols || 1}
          onClick={() => onClick(item)}
        >
          <img src={item.src} alt={item.title} />
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

export default ImageList;
