/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useMemo, useCallback } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button, { ButtonSizes } from '+components/Button';
import Checkbox from '+components/Checkbox';
import { ScrollBarMixin } from '+components/ScrollBar';

const not = (a, b) => {
  const fixedB = b.map((el) => el.id);
  return a.filter((value) => fixedB.indexOf(value.id) === -1);
};

const intersection = (a, b) => {
  const fixedB = b.map((el) => el.id);
  return a.filter((value) => fixedB.indexOf(value.id) !== -1);
};

const union = (a, b) => ([...a, ...not(b, a)]);

const onNoop = () => {};

/**
 * A transfer list (or "shuttle") enables the user to move one or more list items between lists.
 */
const TransferList = styled((props) => {
  const {
    className,
    options,
    input,
    leftTitle,
    rightTitle,
  } = props;

  const value = input?.value || props.value;
  const onChange = input.onChange || props.onChange;

  const [checked, setChecked] = useState([]);

  const fixedOptions = useMemo(
    () => (not(options, value)),
    [options, value],
  );

  const leftChecked = intersection(checked, options);
  const rightChecked = intersection(checked, value);

  const onCheckedLeft = useCallback(
    () => {
      onChange(not(value, rightChecked));
      setChecked(not(checked, rightChecked));
    },
    [checked, onChange, value, rightChecked],
  );

  const onCheckedRight = useCallback(
    () => {
      onChange(value.concat(leftChecked));
      setChecked(not(checked, leftChecked));
    },
    [checked, leftChecked, onChange, value],
  );

  const numberOfChecked = useCallback(
    (items) => intersection(checked, items).length,
    [checked],
  );

  const onToggle = useCallback(
    (newValue) => () => {
      const currentIndex = checked.indexOf(newValue);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(newValue);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setChecked(newChecked);
    },
    [checked],
  );

  const onToggleAll = useCallback(
    (items) => () => {
      if (numberOfChecked(items) === items.length) {
        setChecked(not(checked, items));
      } else {
        setChecked(union(checked, items));
      }
    },
    [checked, numberOfChecked],
  );

  const customList = useCallback(
    (title, items) => (
      <Card>
        <CardHeader
          avatar={
            <Checkbox
              onClick={onToggleAll(items)}
              checked={numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
              disabled={items.length === 0}
              inputProps={{ 'aria-label': 'all items selected' }}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <List dense component="div" role="list">
          {items.map((el) => {
            const id = `transfer-list-all-item-${el.id}-label`;

            return (
              <ListItem key={el.id} role="listitem" button onClick={onToggle(el)}>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(el) !== -1}
                    tabIndex={-1}
                    inputProps={{ 'aria-labelledby': id }}
                    disableRipple
                  />
                </ListItemIcon>
                {el.img && (
                  <ListItemIcon>
                    <img src={el.img} alt={el.title || 'Image'} />
                  </ListItemIcon>
                )}
                {el.title && <ListItemText id={id} primary={el.title} />}
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    ),
    [checked, numberOfChecked, onToggle, onToggleAll],
  );

  return (
    <Grid
      className={classNames('transfer-list', className || '')}
      spacing={3}
      justify="center"
      alignItems="center"
      wrap="nowrap"
      container
    >
      <Grid
        className={classNames('list', 'list-left')}
        item
      >
        {customList(leftTitle, fixedOptions)}
      </Grid>

      <Grid item>
        <Grid
          className="buttons-container"
          direction="column"
          alignItems="center"
          container
        >
          <Button
            variant="outlined"
            size={ButtonSizes.small}
            onClick={onCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size={ButtonSizes.small}
            onClick={onCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>

      <Grid
        className={classNames('list', 'list-right')}
        item
      >
        {customList(rightTitle, value)}
      </Grid>
    </Grid>
  );
})`
  width: 100%;
  height: 100%;

  .list {
    width: 100%;
    height: 100%;
    padding: 0;

    .MuiCard-root {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
    }
    
    .MuiList-root {
      overflow-y: auto;
      height: 100%;
      max-height: 100%;

      ${ScrollBarMixin};
    }

    .MuiListItemIcon-root {
      min-width: unset;
      margin-right: 16px;
    }
  }

  .buttons-container {
    ${Button} + ${Button} {
      margin-top: 8px;
    }
  }

`;

TransferList.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({})),
  input: PropTypes.shape({
    value: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
  }),
  value: PropTypes.arrayOf(PropTypes.shape({})),
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  not: PropTypes.func,
  intersection: PropTypes.func,
  union: PropTypes.func,
  onChange: PropTypes.func,
};

TransferList.defaultProps = {
  className: '',
  options: {},
  input: null,
  value: [],
  leftTitle: 'Choices',
  rightTitle: 'Chosen',
  not: PropTypes.func,
  intersection: PropTypes.func,
  union: PropTypes.func,
  onChange: onNoop,
};

export default TransferList;
