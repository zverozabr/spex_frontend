/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';

import { Field, Controls } from '+components/Form';
import FormModal from '+components/FormModal';
import Select, { Option } from '+components/Select';

import Row from './Row';

const none = 'none';

const FormModalManageImages = styled((props) => {
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
  const omeroDatasets = useSelector(omeroSelectors.getDatasets(omeroProjectId));
  const omeroImages = useSelector(omeroSelectors.getImages(omeroDatasetId));
  const omeroThumbnails = useSelector(omeroSelectors.getThumbnails(omeroDatasetId));

  const options = useMemo(
    () => (Object.keys(omeroThumbnails || {}).map((id) => ({ id, img: omeroThumbnails[id] }))),
    [omeroThumbnails],
  );

  const onProjectChange = useCallback(
    ({ target: { value } }) => {
      setOmeroProjectId(value);
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
      if (!omeroImages?.length) {
        return undefined;
      }

      const imageIds = omeroImages.map((item) => item.id);
      dispatch(omeroActions.fetchThumbnails({ groupId: omeroDatasetId, imageIds }));
      return () => {
        dispatch(omeroActions.clearThumbnails(omeroDatasetId));
      };
    },
    [dispatch, omeroDatasetId, omeroImages],
  );

  return (
    <FormModal
      className={className}
      header={header}
      initialValues={initialValues}
      closeButtonText={closeButtonText}
      submitButtonText={submitButtonText}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Row>
        <Select
          defaultValue={none}
          value={omeroProjectId}
          onChange={onProjectChange}
          disabled={isOmeroFetching}
        >
          <Option value={none}>Select project</Option>
          {omeroProjects?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
        </Select>

        <Select
          defaultValue={none}
          value={omeroDatasetId}
          onChange={onDatasetChange}
          disabled={isOmeroFetching || (omeroProjectId && omeroProjectId === none)}
        >
          <Option value={none}>Select dataset</Option>
          {omeroDatasets?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
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

FormModalManageImages.propTypes = {
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

FormModalManageImages.defaultProps = {
  className: '',
  header: '',
  initialValues: null,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  onClose: () => {},
  onSubmit: () => {},
};

export default FormModalManageImages;
