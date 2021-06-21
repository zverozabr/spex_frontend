/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';

import { Field, Controls, Validators } from '+components/Form';
import FormModal from '+components/FormModal';
import Select, { Option } from '+components/Select';

import Group from './Group';
import Row from './Row';

const none = 'none';

const JobFormModal = styled((props) => {
  const {
    className,
    header,
    initialValues,
    closeButtonText,
    submitButtonText,
    open,
    onClose,
    onSubmit,
  } = props;

  const dispatch = useDispatch();

  const [omeroProjectId, setOmeroProjectId] = useState(none);
  const [omeroDatasetId, setOmeroDatasetId] = useState(none);

  const isOmeroFetching = useSelector(omeroSelectors.isFetching);
  const omeroProjects = useSelector(omeroSelectors.getProjects);
  const omeroProjectDatasets = useSelector(omeroSelectors.getDatasets(omeroProjectId));
  const omeroDatasetImages = useSelector(omeroSelectors.getImages(omeroDatasetId));
  const omeroDatasetThumbnails = useSelector(omeroSelectors.getThumbnails(omeroDatasetId));

  const jobThumbnails = useSelector(omeroSelectors.getThumbnails(initialValues.id));

  const normalizedJobThumbnails = useMemo(
    () => (Object.keys(jobThumbnails || {}).map((id) =>({ id, img: jobThumbnails[id] }))),
    [jobThumbnails],
  );

  const options = useMemo(
    () => (Object.keys(omeroDatasetThumbnails || {}).map((id) => ({ id, img: omeroDatasetThumbnails[id] }))),
    [omeroDatasetThumbnails],
  );

  const onProjectChange = useCallback(
    ({ target: { value } }) => {
      setOmeroProjectId(value);
      setOmeroDatasetId(none);
    },
    [],
  );

  const onDatasetChange = useCallback(
    ({ target: { value } }) => {
      setOmeroDatasetId(value);
    },
    [],
  );

  useEffect(
    () => {
      if (omeroProjects.length) {
        return;
      }

      dispatch(omeroActions.fetchProjects());
    },
    [dispatch, omeroProjects.length],
  );

  useEffect(
    () => {
      if (!omeroProjectId || omeroProjectId === none) {
        return undefined;
      }

      dispatch(omeroActions.fetchDatasets(omeroProjectId));
      return () => {
        dispatch(omeroActions.clearDatasets(omeroProjectId));
      };
    },
    [dispatch, omeroProjectId],
  );

  useEffect(
    () => {
      if (!omeroDatasetId || omeroDatasetId === none) {
        return undefined;
      }

      dispatch(omeroActions.fetchImages(omeroDatasetId));
      return () => {
        dispatch(omeroActions.clearImages(omeroDatasetId));
      };
    },
    [dispatch, omeroDatasetId],
  );

  useEffect(
    () => {
      if (!omeroDatasetImages?.length) {
        return undefined;
      }

      const imageIds = omeroDatasetImages.map((item) => item.id);
      dispatch(omeroActions.fetchThumbnails({ groupId: omeroDatasetId, imageIds }));
      return () => {
        dispatch(omeroActions.clearThumbnails(omeroDatasetId));
      };
    },
    [dispatch, omeroDatasetId, omeroDatasetImages],
  );

  useEffect(
    () => {
      const { id, omeroIds } = initialValues;
      if (omeroIds.length > 0) {
        dispatch(omeroActions.fetchThumbnails({ groupId: id, imageIds: omeroIds }));
      }
      return () => {
        dispatch(omeroActions.clearThumbnails(id));
      };
    },
    [dispatch, initialValues],
  );

  return (
    <FormModal
      className={className}
      header={header}
      initialValues={{ ...initialValues, omeroIds: normalizedJobThumbnails }}
      closeButtonText={closeButtonText}
      submitButtonText={submitButtonText}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Field
        name="name"
        label="Name"
        component={Controls.TextField}
        validate={Validators.required}
        required
      />

      <Field
        name="с"
        label="Channel"
        component={Controls.TextField}
        InputProps={{
          inputProps: {
            type: 'number',
            min: 0, max: 25,
          },
        }}
        validate={Validators.required}
        required
      />

      <Field
        name="size"
        label="Size"
        component={Controls.TextField}
        InputProps={{
          inputProps: {
            type: 'number',
            min: 1, max: 25,
          },
        }}
        validate={Validators.required}
        required
      />

      <Group>
        <Row>
          <Select
            defaultValue={none}
            value={omeroProjectId}
            onChange={onProjectChange}
            disabled={isOmeroFetching}
          >
            <Option value={none}>Select Omero Project</Option>
            {omeroProjects?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
          </Select>

          <Select
            defaultValue={none}
            value={omeroDatasetId}
            onChange={onDatasetChange}
            disabled={isOmeroFetching || (omeroProjectId && omeroProjectId === none)}
          >
            <Option value={none}>Select Omero Dataset</Option>
            {omeroProjectDatasets?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
          </Select>
        </Row>

        <Row>
          <Field
            name="omeroIds"
            label="Omero IDs"
            component={Controls.TransferList}
            options={options}
          />
        </Row>
      </Group>
    </FormModal>
  );
})`
  ${Row} + ${Row} {
    margin-top: 20px;
  }

  .transfer-list {
    height: 300px;
    margin: 0 auto;
  }
`;

JobFormModal.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Modal title.
   */
  header: PropTypes.string,
  /**
   * Initial values.
   */
  initialValues: PropTypes.shape({}),
  /**
   * Text for the close button.
   */
  closeButtonText: PropTypes.string,
  /**
   * Text for the confirm button.
   */
  submitButtonText: PropTypes.string,
  /**
   * If true, the modal is open.
   */
  open: PropTypes.bool,
  /**
   * Callback fired when the component requests to be closed.
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when data is changed.
   */
  onChange: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

JobFormModal.defaultProps = {
  className: '',
  header: '',
  initialValues: null,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  onClose: () => {},
  onSubmit: () => {},
};

export default JobFormModal;
