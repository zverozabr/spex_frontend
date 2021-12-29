/**
 * @param {number} num
 * @param {number[]} arr
 * @return {*}
 */
export const closest = (num, arr) => arr
    .reduce((prev, curr) => Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
