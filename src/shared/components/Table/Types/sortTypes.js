export const boolean = (rowA, rowB, id) => Number(!!rowA.values[ id ]) - Number(!!rowB.values[ id ]);
