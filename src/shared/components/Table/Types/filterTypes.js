export const selectAllOrEqual = (rows, [ id ], filterValue) => {
    if (filterValue === 'all') {
        return rows;
    }

    return rows.filter(({ values }) => values[ id ] === filterValue);
};

selectAllOrEqual.autoRemove = (val) => !val || !val.length;

export const selectAllOrArrayIncludes = (rows, [ id ], filterValue) => {
    if (filterValue === 'all') {
        return rows;
    }

    return rows.filter(({ values }) => Array.isArray(values[ id ])
    && values[ id ].includes(filterValue));
};

selectAllOrArrayIncludes.autoRemove = (val) => !val || !val.length;

export const selectAllOrMatchBoolean = (rows, [ id ], filterValue) => {
    if (filterValue === 'all') {
        return rows;
    }

    return rows.filter(({ values }) => filterValue === 'true' ? values[ id ] : !values[ id ]);
};

selectAllOrMatchBoolean.autoRemove = (val) => val == null;

export const regExp = (rows, [ id ], filterValue) => {
    if ((filterValue ?? '') === '') {
        return rows;
    }

    // eslint-disable-next-line require-unicode-regexp,security/detect-non-literal-regexp
    const reg = new RegExp(String(filterValue), 'i');

    return rows.filter(({ values }) => reg.test(String(values[ id ] ?? '')));
};

regExp.autoRemove = (val) => !val;
