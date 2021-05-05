import React, { useCallback, useMemo } from 'react';
import capitalize from 'lodash.capitalize';
import PropTypes from 'prop-types';
import isFunction from '+utils/isFunction';

const defaultOptionValueExtractor = (row, id) => row.values[ id ];
const defaultOptionTitle = (value) => capitalize(value);

/**
 * @param {function(row: {}, id: string): any} [optionValueExtractor] - callback for extracting options values, default: `(row, id) => row.values[id]`
 * @param {function(value: string): string} [optionTitle] - callback for rendering title of option, default: `(value) => capitalize(value)`
 * @param {boolean} sort - values should be sort, default: true
 * @param {string[]} fixedOptions - array of fixed options
 * @return {function(*): JSX.Element}
 */
export const SelectColumnFilter = ({
    optionValueExtractor,
    optionTitle,
    sort = true,
    fixedOptions,
} = {}) => {
    const fnOptionValueExtractor = isFunction(optionValueExtractor) ? optionValueExtractor : defaultOptionValueExtractor;
    const fnOptionTitle = isFunction(optionTitle) ? optionTitle : defaultOptionTitle;

    const Component = (props) => {
        const { preFilteredRows, column: { filterValue, setFilter, id } } = props;

        const options = useMemo(
            () => {
                if (Array.isArray(fixedOptions)) {
                    return fixedOptions;
                }

                const set = new Set(preFilteredRows.flatMap((row) => fnOptionValueExtractor(row, id)));

                if (set.has('all')) {
                    set.remove('all');
                }

                let result = [ ...set.values() ];
                result = sort ? result.sort() : result;
                result.unshift('all');

                return result;
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [ preFilteredRows, fnOptionValueExtractor, id, sort, fixedOptions ],
        );

        const onChange = useCallback(
            (event) => setFilter(event.target.value),
            [ setFilter ],
        );

        return (
            // eslint-disable-next-line jsx-a11y/no-onchange
          <select
            onChange={onChange}
            style={{
                    width: '100%',
                    height: '100%',
            }}
            value={filterValue ?? 'all'}
          >
            {options.map((value) => (
              <option value={value} key={value}>
                {fnOptionTitle(value)}
              </option>
                ))}
          </select>
        );
    };

    Component.propTypes = {
        preFilteredRows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        column: PropTypes.shape({
            filterValue: PropTypes.string,
            setFilter: PropTypes.func,
            id: PropTypes.string,
        }).isRequired,
    };

    return Component;
};
