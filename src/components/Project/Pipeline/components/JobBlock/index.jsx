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

  return (
    <Container>
      <div>
        {data.label && <strong>{data.label}</strong>}

        {data.onDelete && (
          <IconButton onClick={() => data.onDelete(data)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {data.onAdd && (
          <IconButton onClick={() => data.onAdd(data)}>
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      <Handle
        type="target"
        position="left"
        isConnectable={isConnectable}
      />

      <Handle
        type="source"
        position="right"
        isConnectable={isConnectable}
      />
    </Container>
  );
};

JobBlock.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default memo(JobBlock);
