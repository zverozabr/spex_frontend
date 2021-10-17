/* eslint-disable react/jsx-handler-names */
import React, { memo } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import PropTypes from 'prop-types';
import { Handle } from 'react-flow-renderer';

import Container from './components/Container';

const JobBlock = (props) => {
  const {
    data,
    isConnectable,
  } = props;

  const isHorizontal = data.direction === 'LR';

  return (
    <Container>
      <div>
        {data.name && <strong>{data.name}</strong>}

        {data.onDelete && (
          <IconButton
            disabled={data.id === 'new'}
            onClick={() => data.onDelete(data)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {data.onAdd && (
          <IconButton
            disabled={data.id === 'new'}
            onClick={() => data.onAdd(data)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      <Handle
        type="target"
        position={isHorizontal ? 'left' : 'top'}
        isConnectable={isConnectable}
      />

      <Handle
        type="source"
        position={isHorizontal ? 'right' : 'bottom'}
        isConnectable={isConnectable}
      />
    </Container>
  );
};

JobBlock.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    direction: PropTypes.string,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default memo(JobBlock);
