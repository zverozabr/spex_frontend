/* eslint-disable react/jsx-handler-names */
import React, { Fragment, memo } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import PropTypes from 'prop-types';
import { Handle } from 'react-flow-renderer';

const Block = (props) => {
  const {
    id,
    data,
    isConnectable,
  } = props;

  return (
    <Fragment>
      <div>
        {data.label && <strong>{data.label}</strong>}

        {data.onDelete && (
          <IconButton onClick={() => data.onDelete(id, data.value)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {data.onAdd && (
          <IconButton onClick={() => data.onAdd(id, data.value)}>
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      <Handle
        type="source"
        position="left"
        isConnectable={isConnectable}
      />

      <Handle
        type="target"
        position="right"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </Fragment>
  );
};

Block.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default memo(Block);
