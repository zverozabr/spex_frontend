import React, { useMemo, useCallback, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { selectors as pipelineSelectors } from '@/redux/modules/pipelines';

const Option = styled.div`
  :before {
    content: '---';
    margin-right: 10px;
    color: #${(props) => props.$color} !important;
    background-color: #${(props) => props.$color} !important;
  }
`;

const getOptionLabel = (option) => option.label;

const renderOption = (option) => (
  <Option key={option.value} $color={option.color}>
    {option.label}
  </Option>
);

const SelectOmeroChannels = (props) => {
  const {
    projectId,
    pipelineId,
    onlyOneValue,
    input,
    meta,
    ...tail
  } = props;

  const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) && meta.touched;
  const onChange = input.onChange || props.onChange;

  const dispatch = useDispatch();

  const pipeline = useSelector(pipelineSelectors.getPipeline(projectId, pipelineId));
  const omeroId = useMemo(() => pipeline?.jobs?.[0]?.tasks?.[0]?.omeroId, [pipeline]);
  const imageDetails = useSelector(omeroSelectors.getImageDetails(omeroId));

  const options = useMemo(
    () => ((imageDetails?.channels || []).map((el, i) => ({
      value: i,
      label: el.label,
      color: el.color,
    }))),
  [imageDetails],
  );

  const fixedValue = useMemo(
    () => {
      let value = input?.value || props.value;
      if (onlyOneValue) {
        return value == null
          ? value
          : options.find((opt) => opt.value === value) || { value, label: value };
      }

      value = value || [];
      return (Array.isArray(value) ? value : [value])
        .map((val) => options.find((opt) => opt.value === val) || { value: val, label: val });
    },
    [input?.value, options, props.value, onlyOneValue],
  );

  const doChange = useCallback(
    (_, val) => {
      onChange?.(onlyOneValue ? val?.value : val?.map((el) => el.value));
    },
    [onChange, onlyOneValue],
  );

  const renderInput = useCallback(
    (params) => (
      <TextField
        {...params}
        helperText={showError ? meta.error || meta.submitError : undefined}
        error={showError}
        label={tail.label || ''}
        variant="outlined"
      />
    ),
    [tail.label, showError, meta.error, meta.submitError],
  );

  useEffect(
    () => {
      if (imageDetails) {
        return;
      }
      dispatch(omeroActions.fetchImageDetails(omeroId));
    },
    [dispatch, imageDetails, omeroId],
  );

  return (
    <Autocomplete
      multiple={!onlyOneValue}
      {...tail}
      renderInput={renderInput}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      options={options}
      value={fixedValue}
      onChange={doChange}
    />
  );
};

SelectOmeroChannels.propTypes = {
  projectId: PropTypes.string,
  pipelineId: PropTypes.string,
  input: PropTypes.shape({
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    onChange: PropTypes.func,
  }),
  meta: PropTypes.shape({
    error: PropTypes.string,
    touched: PropTypes.bool,
    submitError: PropTypes.string,
    dirtySinceLastSubmit: PropTypes.bool,
  }),
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func,
  onlyOneValue: PropTypes.bool,
};

SelectOmeroChannels.defaultProps = {
  projectId: '',
  pipelineId: '',
  input: {},
  meta: {},
  value: null,
  onChange: null,
  onlyOneValue: false,
};

export default SelectOmeroChannels;
