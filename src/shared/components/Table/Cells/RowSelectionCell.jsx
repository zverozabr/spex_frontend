import React from 'react';
import styled from 'styled-components';
import Checkbox from '+components/Checkbox';

const RowSelectionCell = styled(({ className, row }) => {
    const { checked, indeterminate, onChange } = row.getToggleRowSelectedProps();
    return <Checkbox className={className} checked={checked} indeterminate={indeterminate} onChange={onChange} />;
}) `

`;

export default RowSelectionCell;
