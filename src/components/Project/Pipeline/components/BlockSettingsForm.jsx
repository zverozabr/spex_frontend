/* eslint-disable react/jsx-sort-default-props */
import React, { useMemo, useCallback } from 'react';
import createFocusOnFirstFieldDecorator from 'final-form-focus-on-first-field';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button, { ButtonColors } from '+components/Button';
import Form, { Controls, Field, FormRenderer, Validators, Parsers } from '+components/Form';
import SelectOmeroImages from '+components/SelectOmeroImages';

const Container = styled.div`
  width: 100%;
  height: 100%;
  form {
    width: 100%;
    height: 100%;
  }
`;

const Header = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  text-transform: capitalize;
  
  :empty {
    display: none;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 20px 0;
  
  gap: 20px;
`;

const Footer = styled.div`
  align-self: flex-end;
  
  :empty {
    display: none;
  }
  
  .MuiButton-root + .MuiButton-root {
    margin-left: 15px;
  }
`;

const getFieldComponent = (type) => {
  switch (type) {
    case 'omeroIds':
      return Controls.SelectOmeroImages;
    case 'number':
      return Controls.NumberField;
    case 'string':
    default:
      return Controls.TextField;
  }
};

const getFieldParser = (type) => {
  switch (type) {
    case 'omeroIds':
      return Parsers.omeroIds;
    default:
      return undefined;
  }
};

const focusOnFirstFieldDecorator = createFocusOnFirstFieldDecorator();

const BlockSettingsForm = (props) => {
  const {
    className,
    children,
    block,
    closeButtonText,
    submitButtonText,
    onClose,
    onSubmit,
    onForm,
    ...tail
  } = props;

  const header = block.description || block.name;

  const blockParamsMeta = useMemo(
    () => ((block.start_params || []).reduce((acc, el) => {
      const { type, description, ...param } = el;
      const [name] = Object.keys(param);
      const meta = { name, label: description, type: type || typeof param[name] };
      return { ...acc, [name]: meta };
    }, {})),
    [block.start_params],
  );

  const blockInitialValues = useMemo(
    () => {
      const values = (block.start_params || []).reduce((acc, el) => {
        const { type, description, ...param } = el;
        return { ...acc, ...param };
      }, {});
      return {
        ...values,
        name: block.name,
        projectId: block.projectId,
        pipelineId: block.pipelineId,
      };
    },
    [block.name, block.pipelineId, block.projectId, block.start_params],
  );

  const render = useCallback(
    ({ form, handleSubmit, submitting }) => {
      if (onForm) {
        onForm(form);
      }

      return (
        <Container className={className}>
          <FormRenderer
            onSubmit={(event) => {
              // eslint-disable-next-line promise/catch-or-return,promise/prefer-await-to-then
              handleSubmit(event)?.then(() => form.restart());
            }}
          >
            <Header>{header}</Header>
            <Body>
              {Object.values(blockParamsMeta).map((params) => (
                <Field
                  key={params.name}
                  name={params.name}
                  label={params.label}
                  projectId={block.projectId}
                  component={getFieldComponent(params.type)}
                  parse={getFieldParser(params.type)}
                  validate={Validators.required}
                />
              ))}
            </Body>
            <Footer>
              <Button
                color={ButtonColors.secondary}
                onClick={(event) => {
                  form.restart();
                  onClose(event);
                }}
              >
                {closeButtonText}
              </Button>
              <Button
                type="submit"
                color={ButtonColors.primary}
                disabled={submitting}
              >
                {submitButtonText}
              </Button>
            </Footer>
          </FormRenderer>
        </Container>
      );
    },
    [onForm, className, header, blockParamsMeta, closeButtonText, submitButtonText, block, onClose],
  );

  return (
    <Form
      {...tail}
      initialValues={blockInitialValues}
      render={render}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
      decorators={[focusOnFirstFieldDecorator]}
      onSubmit={onSubmit}
    />
  );
};

const propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Form fields.
   */
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
  /**
   * Initial values.
   */
  block: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    projectId: PropTypes.string,
    pipelineId: PropTypes.string,
    start_params: PropTypes.arrayOf(PropTypes.shape({})),
  }),
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
   * Modal props.
   */
  modalProps: PropTypes.shape({}),
  /**
   * Callback fired when the form is created.
   */
  onForm: PropTypes.func,
  /**
   * Callback fired when the component requests to be closed.
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

const defaultProps = {
  className: '',
  children: null,
  block: null,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  modalProps: null,
  onForm: () => {},
  onClose: () => {},
  onSubmit: () => {},
};

BlockSettingsForm.propTypes = propTypes;
BlockSettingsForm.defaultProps = defaultProps;

export {
  BlockSettingsForm as default,
  propTypes,
  defaultProps,
};

