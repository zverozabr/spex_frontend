/* eslint-disable react/jsx-handler-names */
import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { Handle } from 'react-flow-renderer';

import Button from '+components/Button';

const Block = (props) => {
  const { id, data, isConnectable } = props;

  return (
    <Fragment>
      <div>
        <strong>{data.label}</strong>
        <Button
          onClick={() => data.onDelete(id, data.value)}
        >
          Delete
        </Button>
      </div>
      <Handle
        type="target"
        position="bottom"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position="top"
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
    onDelete: PropTypes.func,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default memo(Block);
