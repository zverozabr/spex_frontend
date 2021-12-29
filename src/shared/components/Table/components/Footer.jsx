/* eslint-disable react/jsx-sort-default-props */
import React, { Fragment } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { getProps } from '../utils';

const Footer = (props) => {
    const {
        footerGroups,
        getFooterProps,
        getFooterGroupProps,
    } = props;

    const [ lastFooterGroup ] = footerGroups.slice(-1);

    return (
      <Fragment>
        {footerGroups.map((footerGroup) => {
                const { key, ...footerGroupProps } = footerGroup.getFooterGroupProps(getFooterGroupProps || {});

                return (
                  <div className={`rt-tfoot -footer${footerGroup === lastFooterGroup ? '' : 'Groups'}`} key={key}>
                    <div className='rt-tr' {...footerGroupProps}>
                      {footerGroup.headers.map((column) => {
                                const columnProps = column.getFooterProps(getProps([
                                    { className: classNames('rt-th rt-resizable-footer') },
                                    getFooterProps,
                                    column.getProps,
                                ]));

                                return (
                                    // eslint-disable-next-line react/jsx-key
                                  <div {...columnProps}>
                                    <div className='rt-resizable-footer-content'>
                                      {column.render('Footer')}
                                    </div>
                                  </div>
                                );
                            })}
                    </div>
                  </div>
                );
            })}
      </Fragment>
    );
};

Footer.propTypes = {
    footerGroups: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    getFooterProps: PropTypes.func,
    getFooterGroupProps: PropTypes.func,
};

Footer.defaultProps = {
    getFooterProps: null,
    getFooterGroupProps: null,
};

export default Footer;
