/* eslint-disable react/jsx-sort-default-props */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';

import {
  Field, Controls, Validators,
  Parsers, FormSpy, WhenFieldChanges,
} from '+components/Form';
import FormModal from '+components/FormModal';
import Select, { Option } from '+components/Select';

import Col from './Col';
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
  const [formValues, setFormValues] = useState({});

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

  const onChange = useCallback(
    ({ values }) => {
      // Workaround for FormSpy - Cannot update a component while rendering a different component
      // @see: https://github.com/final-form/react-final-form/issues/809
      setTimeout(() => { setFormValues(values); }, 0);
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
      <FormSpy
        subscription={{ values: true }}
        onChange={onChange}
      />

      <WhenFieldChanges
        field="single"
        becomes={true} //eslint-disable-line react/jsx-boolean-value
        set="omeroIds"
        to={[]}
      />

      <WhenFieldChanges
        field="single"
        becomes={false}
        set="content.segment"
        to={false}
      />

      <WhenFieldChanges
        field="content.segment"
        becomes={false}
        set="content.start.x"
        to={undefined}
      />

      <WhenFieldChanges
        field="content.segment"
        becomes={false}
        set="content.start.y"
        to={undefined}
      />

      <WhenFieldChanges
        field="content.segment"
        becomes={false}
        set="content.stop.x"
        to={undefined}
      />

      <WhenFieldChanges
        field="content.segment"
        becomes={false}
        set="content.stop.y"
        to={undefined}
      />

      <Col $maxWidth="390px">
        <Field
          name="name"
          label="Name"
          component={Controls.TextField}
          validate={Validators.required}
        />

        <Group>
          <Row>
            <Field
              name="content.c"
              label="Channel"
              component={Controls.TextField}
              InputProps={{
              inputProps: {
                type: 'number',
                min: 0,
              },
              }}
              parse={Parsers.number}
              validate={Validators.required}
            />

            <Field
              name="content.size"
              label="Size"
              component={Controls.TextField}
              InputProps={{
              inputProps: {
                type: 'number',
                min: 1, max: 25,
              },
              }}
              parse={Parsers.number}
              validate={Validators.required}
            />
          </Row>
        </Group>

        <Group $label="Slice*">
          <Row>
            <Field
              name="content.slice.x"
              label="X"
              component={Controls.TextField}
              InputProps={{
              inputProps: {
                type: 'number',
                min: 1,
              },
              }}
              parse={Parsers.number}
              validate={Validators.required}
            />

            <Field
              name="content.slice.y"
              label="Y"
              component={Controls.TextField}
              InputProps={{
              inputProps: {
                type: 'number',
                min: 1,
              },
              }}
              parse={Parsers.number}
              validate={Validators.required}
            />

            <Field
              name="content.slice.margin"
              label="Margin"
              component={Controls.TextField}
              InputProps={{
              inputProps: {
                type: 'number',
                min: 1,
              },
              }}
              parse={Parsers.number}
              validate={Validators.required}
            />
          </Row>
        </Group>

        <Group>
          <label>
            <Field
              name="single"
              component={Controls.Radio}
              type="radio"
              value="true" // eslint-disable-line react/jsx-boolean-value
              parse={(val) => val === 'true'}
              format={(val) => String(val || false)}
            />{' '}
            One Picture
          </label>
          <label>
            <Field
              name="single"
              component={Controls.Radio}
              type="radio"
              value="false"
              parse={(val) => val === 'true'}
              format={(val) => String(val || false)}
            />{' '}
            Multi Picture
          </label>
        </Group>

        <Group $disabled={!formValues.single}>
          <Row>
            <label>
              <Field
                name="content.segment"
                component={Controls.Checkbox}
                type="checkbox"
                disabled={!formValues.single}
              />{' '}
              Segment
            </label>
          </Row>

          <Row>
            <Field
              name="content.start.x"
              label="StartX"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
              }}
              parse={Parsers.number}
              disabled={!formValues.content?.segment}
              validate={Validators.requiredConditional('content.segment')}
            />

            <Field
              name="content.start.y"
              label="StartY"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
              }}
              parse={Parsers.number}
              disabled={!formValues.content?.segment}
              validate={Validators.requiredConditional('content.segment')}
            />

            <Field
              name="content.stop.x"
              label="StopX"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
              }}
              parse={Parsers.number}
              disabled={!formValues.content?.segment}
              validate={Validators.requiredConditional('content.segment')}
            />

            <Field
              name="content.stop.y"
              label="StopY"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 0,
                },
              }}
              parse={Parsers.number}
              disabled={!formValues.content?.segment}
              validate={Validators.requiredConditional('content.segment')}
            />
          </Row>
        </Group>
      </Col>

      <Col>
        <Group $label="Images" $height="100%">
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

          {!formValues.single && (
            <Field
              name="omeroIds"
              label="Omero IDs"
              component={Controls.TransferList}
              options={options}
              validate={Validators.required}
            />
          )}
        </Group>
      </Col>
    </FormModal>
  );
})`
  .modal-content {
    width: 80%;
    min-width: 840px;
    max-width: 1280px;
  }
  
  .modal-body {
    display: flex;
    flex-direction: row;
    min-height: 540px;
  }

  ${Col} + ${Col} {
    margin-left: 20px;
  }

  ${Row} + ${Row},
  ${Row} + ${Group},
  ${Group} + ${Row},
  ${Group} + ${Group},
  ${Row} + .MuiFormControl-root,
  ${Group} + .MuiFormControl-root,
  .MuiFormControl-root + ${Row},
  .MuiFormControl-root + ${Group} {
    margin-top: 20px;
  }

  .transfer-list {
    height: 100%;
    margin: 20px auto 0 auto;
  }

  label {
    white-space: nowrap;
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
