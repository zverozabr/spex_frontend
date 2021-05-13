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

import Row from './Row';

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
  const omeroProjectDatasets = useSelector(omeroSelectors.getDatasets(omeroProjectId));
  const omeroDatasetImages = useSelector(omeroSelectors.getImages(omeroDatasetId));
  const omeroDatasetThumbnails = useSelector(omeroSelectors.getThumbnails(omeroDatasetId));

  const hashOmeroDatasetImages = useMemo(
    () => (omeroDatasetImages || []).reduce((acc, el) => ({ ...acc, [el.id]: el }), {}),
    [omeroDatasetImages],
  );

  const options = useMemo(
    () => (Object.keys(omeroDatasetThumbnails || {}).map((id) => ({
      id: +id,
      img: omeroDatasetThumbnails[id],
      title: hashOmeroDatasetImages[id].name,
    }))),
    [hashOmeroDatasetImages, omeroDatasetThumbnails],
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
      if (!omeroProjectId || omeroProjectId === none) {
        return;
      }
      dispatch(omeroActions.fetchDatasets(omeroProjectId));
    },
    [dispatch, omeroProjectId],
  );

  useEffect(
    () => {
      if (!omeroDatasetId || omeroDatasetId === none) {
        return;
      }
      dispatch(omeroActions.fetchImages(omeroDatasetId));
    },
    [dispatch, omeroDatasetId],
  );


  useEffect(
    () => {
      if (!omeroDatasetImages?.length || Object.keys(omeroDatasetThumbnails || {}).length) {
        return;
      }
      const imageIds = omeroDatasetImages.map((item) => item.id);
      dispatch(omeroActions.fetchThumbnails({ groupId: omeroDatasetId, imageIds }));
    },
    [dispatch, omeroDatasetId, omeroDatasetImages, omeroDatasetThumbnails],
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
            {omeroProjectDatasets?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
          </Select>
        </Row>

        <Row>
          <TransferList
            options={options}
            value={value}
            onChange={setValue}
          />
        </Row>
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
  ${Row} + ${Row} {
    margin-top: 20px;
  }
  
  .transfer-list {
    height: 300px;
    margin: 0 auto;
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
