/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';

import Button, { ButtonColors } from '+components/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';
import Select, { Option } from '+components/Select';
import TransferList from '+components/TransferList';

const none = 'none';

const ManageImagesModal = styled((props) => {
  const {
    className,
    header,
    open,
    project,
    closeButtonText,
    submitButtonText,
    onClose,
    onSubmit,
  } = props;

  const dispatch = useDispatch();

  const [omeroProjectId, setOmeroProjectId] = useState(none);
  const [omeroDatasetId, setOmeroDatasetId] = useState(none);

  const [value, setValue] = useState(project?.omeroIds || []);

  const isOmeroFetching = useSelector(omeroSelectors.isFetching);
  const omeroProjects = useSelector(omeroSelectors.getProjects);
  const omeroDatasets = useSelector(omeroSelectors.getDatasets(omeroProjectId));
  const omeroImages = useSelector(omeroSelectors.getImages(omeroDatasetId));
  const omeroThumbnails = useSelector(omeroSelectors.getThumbnails(omeroDatasetId));

  const hashOmeroImages = useMemo(
    () => (omeroImages || []).reduce((acc, el) => ({ ...acc, [el.id]: el }), {}),
    [omeroImages],
  );

  const options = useMemo(
    () => (Object.keys(omeroThumbnails || {}).map((id) => ({
      id,
      img: omeroThumbnails[id],
      title: hashOmeroImages[id].name,
    }))),
    [omeroThumbnails, hashOmeroImages],
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

  const emitSubmit = useCallback(
    () => {
      const selected = value.map((el) => el?.id || el);
      onSubmit(selected);
    },
    [onSubmit, value],
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
      if (omeroProjectId && omeroProjectId === none) {
        return;
      }
      dispatch(omeroActions.fetchDatasets(omeroProjectId));
    },
    [dispatch, omeroProjectId],
  );

  useEffect(
    () => {
      if (!omeroDatasetId || omeroImages?.length) {
        return;
      }
      dispatch(omeroActions.fetchImages(omeroDatasetId));
    },
    [dispatch, omeroDatasetId, omeroImages?.length],
  );

  useEffect(
    () => {
      if (!omeroImages?.length || Object.keys(omeroThumbnails || {}).length) {
        return;
      }
      const imageIds = omeroImages.map((item) => item.id);
      dispatch(omeroActions.fetchThumbnails({ groupId: omeroDatasetId, imageIds }));
    },
    [dispatch, omeroDatasetId, omeroImages, omeroThumbnails],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearDatasets(omeroProjectId));
    },
    [omeroProjectId, dispatch],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearImages(omeroDatasetId));
      dispatch(omeroActions.clearThumbnails(omeroDatasetId));
    },
    [dispatch, omeroDatasetId],
  );

  return (
    <Modal
      className={className}
      open={open}
      onClose={onClose}
    >
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
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

        <TransferList
          options={options}
          value={value}
          onChangeRight={setValue}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color={ButtonColors.secondary}
          onClick={onClose}
        >
          {closeButtonText}
        </Button>
        <Button
          color={ButtonColors.primary}
          onClick={emitSubmit}
        >
          {submitButtonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
})`
  ${ModalBody} {
    .MuiFormControl-root ~ .MuiFormControl-root {
      margin-top: 14px;
    }
  }
`;

ManageImagesModal.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Modal title.
   */
  header: PropTypes.string,
  /**
   * If true, the modal is open.
   */
  open: PropTypes.bool,
  /**
   * Text for the close button.
   */
  closeButtonText: PropTypes.string,
  /**
   * Text for the confirm button.
   */
  submitButtonText: PropTypes.string,
  /**
   * Callback fired when the component requests to be closed. .
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

ManageImagesModal.defaultProps = {
  className: '',
  header: '',
  open: false,
  closeButtonText: 'Chancel',
  submitButtonText: 'Submit',
  onClose: () => {},
  onSubmit: () => {},
};

export default ManageImagesModal;
