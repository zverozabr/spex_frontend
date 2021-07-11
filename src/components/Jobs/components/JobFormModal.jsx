/* eslint-disable react/jsx-sort-default-props */
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
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
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState({});

  const isOmeroFetching = useSelector(omeroSelectors.isFetching);
  const omeroProjects = useSelector(omeroSelectors.getProjects);
  const omeroProjectDatasets = useSelector(omeroSelectors.getDatasets(omeroProjectId));
  const omeroDatasetImages = useSelector(omeroSelectors.getImages(omeroDatasetId));
  const omeroDatasetThumbnails = useSelector(omeroSelectors.getThumbnails(omeroDatasetId));

  const jobThumbnails = useSelector(omeroSelectors.getThumbnails(initialValues.id));

  const imageDetails = useSelector(omeroSelectors.getImageDetails(formValues.omeroIds?.[0]?.id));

  const normalizedOmeroIds = useMemo(
    () => (Object.keys(jobThumbnails || {}).map((id) =>({ id, img: jobThumbnails[id] }))),
    [jobThumbnails],
  );

  const omeroImagesAsOptions = useMemo(
    () => (Object.keys(omeroDatasetThumbnails || {}).map((id) => ({ id, img: omeroDatasetThumbnails[id] }))),
    [omeroDatasetThumbnails],
  );

  const segmentationArea = useMemo(
    () => {
      if (!formValues?.content?.segment) {
        return null;
      }

      const val = [formValues.content.start, formValues.content.stop];
      if (val.filter((el) => el?.x >= 0 && el?.y >=0).length !== 2) {
        return null;
      }

      return val;
    },
    [formValues],
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

  const onForm = useCallback(
    (form) => {
      formRef.current = form;
    },
    [],
  );

  const onFormChange = useCallback(
    ({ values }) => {
      // Workaround for FormSpy - Cannot update a component while rendering a different component
      // @see: https://github.com/final-form/react-final-form/issues/809
      setTimeout(() => { setFormValues(values); }, 0);
    },
    [],
  );

  const onAreaChange = useCallback(
    (area) => {
      const { current: form } = formRef;

      if (!area) {
        form.change('content.start', {});
        form.change('content.stop', {});
        return;
      }

      form.change('content.start', { x: area[0].x, y: area[0].y });
      form.change('content.stop', { x: area[1].x, y: area[1].y });
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

  useEffect(
    () => {
      if (!formValues.omeroIds?.length) {
        return;
      }
      const { id: imageId } = formValues.omeroIds[0];
      dispatch(omeroActions.fetchImageDetails(imageId));
      return () => {
        dispatch(omeroActions.clearImageDetails(imageId));
      };
    },
    [dispatch, formValues.omeroIds],
  );

  useEffect(
    () => {
      if (imageDetails?.meta && formValues.omeroIds?.length === 1) {
        setOmeroProjectId(imageDetails.meta.projectId);
        setOmeroDatasetId(imageDetails.meta.datasetId);
      }
    },
    [formValues.omeroIds?.length, imageDetails],
  );

  return (
    <FormModal
      className={className}
      header={header}
      initialValues={{
        ...initialValues,
        single: initialValues.single ?? normalizedOmeroIds.length <= 1,
        slices: initialValues.content.slice,
        omeroIds: normalizedOmeroIds,
      }}
      closeButtonText={closeButtonText}
      submitButtonText={submitButtonText}
      open={open}
      onForm={onForm}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <FormSpy
        subscription={{ values: true }}
        onChange={onFormChange}
      />

      <WhenFieldChanges
        field="single"
        becomes={true} //eslint-disable-line react/jsx-boolean-value
        set="omeroIds"
        to={formValues.omeroIds?.length > 1 ? [formValues.omeroIds[0]] : formValues.omeroIds}
      />

      <WhenFieldChanges
        field="slices"
        becomes={false}
        set="content.slice"
        to={undefined}
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
        set="content.start"
        to={undefined}
      />

      <WhenFieldChanges
        field="content.segment"
        becomes={false}
        set="content.stop"
        to={undefined}
      />

      <Col>
        <Group $label="Images" $height="100%">
          <Row>
            <Field
              name="single"
              formControlProps={{
                hiddenLabel: true, // not working
                className: 'hidden-label',
              }}
              component={Controls.Select}
              validate={Validators.required}
            >
              <Controls.SelectOption value={true}>One Image Mode</Controls.SelectOption> {/* eslint-disable-line react/jsx-boolean-value */}
              <Controls.SelectOption value={false}>Multi Images Mode</Controls.SelectOption>
            </Field>

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

          {formValues.single && (
            <Field
              name="omeroIds"
              label="Omero IDs"
              component={Controls.ImagePicker}
              editable={formValues?.content?.segment}
              area={segmentationArea}
              options={omeroImagesAsOptions}
              validate={Validators.required}
              onAreaChange={onAreaChange}
            />
          )}

          {!formValues.single && (
            <Field
              name="omeroIds"
              label="Omero IDs"
              component={Controls.TransferList}
              options={omeroImagesAsOptions}
              validate={Validators.required}
            />
          )}
        </Group>
      </Col>

      <Col $maxWidth="390px">
        <Group $label="Main" $disabled={formValues.omeroIds?.length === 0}>
          <Field
            name="name"
            label="Job Type"
            component={Controls.Select}
            validate={Validators.requiredConditional('omeroIds')}
          >
            <Controls.SelectOption value="segmentation">Segmentation</Controls.SelectOption>
          </Field>

          <Field
            name="content.c"
            label="Channel"
            component={Controls.Select}
            validate={Validators.requiredConditional('omeroIds')}
          >
            {imageDetails?.channels.map((el, i) => (
              <Controls.SelectOption key={`${el.color}_${el.label}`} value={i}>
                {`${i} ${el.label}`}
              </Controls.SelectOption>
            ))}
          </Field>

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
            parse={(v) => Parsers.numberBetween(v, 1, 25)}
            validate={Validators.requiredConditional('omeroIds')}
          />
        </Group>

        <Group $label="Slices" $disabled={formValues.omeroIds?.length === 0}>
          <Row>
            <label>
              <Field
                name="slices"
                component={Controls.Checkbox}
                type="checkbox"
              />{' '}
              Cut Into Slices
            </label>
          </Row>

          <Row>
            <Field
              name="content.slice.x"
              label="Width"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 1,
                  max: Math.round((imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER) / 2),
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 1, Math.round((imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER) / 2))}
              validate={Validators.requiredConditional('slices')}
              disabled={!formValues.slices}
            />

            <Field
              name="content.slice.y"
              label="Height"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 1,
                  max: Math.round((imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER) / 2),
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 1, Math.round((imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER) / 2))}
              validate={Validators.requiredConditional('slices')}
              disabled={!formValues.slices}
            />

            <Field
              name="content.slice.margin"
              label="Margin"
              component={Controls.TextField}
              InputProps={{
                inputProps: {
                  type: 'number',
                  min: 15,
                  max: 100,
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 15, 100)}
              validate={Validators.requiredConditional('slices')}
              disabled={!formValues.slices}
            />
          </Row>
        </Group>

        <Group $label="Segment" $disabled={!formValues.single || formValues.omeroIds?.length === 0}>
          <Row>
            <label>
              <Field
                name="content.segment"
                component={Controls.Checkbox}
                type="checkbox"
                disabled={!formValues.single}
              />{' '}
              Process One Segment Only
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
                  max: imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER,
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 0, imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER)}
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
                  max: imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER,
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 0, imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER)}
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
                  max: imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER,
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 0, imageDetails?.size?.width ?? Number.MAX_SAFE_INTEGER)}
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
                  max: imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER,
                },
              }}
              parse={(v) => Parsers.numberBetween(v, 0, imageDetails?.size?.height ?? Number.MAX_SAFE_INTEGER)}
              disabled={!formValues.content?.segment}
              validate={Validators.requiredConditional('content.segment')}
            />
          </Row>
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

  .transfer-list,
  .image-picker {
    height: 100%;
    margin: 20px auto 0 auto;
  }

  label {
    white-space: nowrap;
  }
  
  .hidden-label {
    label {
      display: none;
    }
    label + .MuiInput-formControl {
      margin-top: unset;
    }
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
