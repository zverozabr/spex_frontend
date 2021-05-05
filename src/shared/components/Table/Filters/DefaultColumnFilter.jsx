import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

const DefaultColumnFilter = ({ column }) => {
    const { filterValue, setFilter } = column;

    const onChange = useCallback(
        // eslint-disable-next-line no-undefined
        (event) => setFilter(event?.target?.value || undefined),
        [ setFilter ],
    );

    return (
      <input
        type='text'
        value={filterValue || ''}
        onChange={onChange}
        style={{ width: '100%' }}
      />
    );
};

DefaultColumnFilter.propTypes = {
    column: PropTypes.shape({
        filterValue: PropTypes.string,
        setFilter: PropTypes.func,
    }).isRequired,
};

export default DefaultColumnFilter;
