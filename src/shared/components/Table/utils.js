import isFunction from '+utils/isFunction';

/**
 * @param {*[]} hooks
 * @return {function(*, *=): *[]}
 */
export const getProps = (hooks) => (props, meta) => [
    props, ...(hooks || []).map((hook) => {
        if (!hook) {
            return {};
        }

        return isFunction(hook) ? hook(meta) : hook;
    }),
];
