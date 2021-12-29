/* eslint-disable react/display-name, react/prop-types */
import React from 'react';
import Checkbox from '+components/Checkbox';

const RowSelectionColumnHeader = ({ getToggleAllRowsSelectedProps }) => {
    const { checked, indeterminate, onChange } = getToggleAllRowsSelectedProps();
    return <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} />;
};

export default RowSelectionColumnHeader;
