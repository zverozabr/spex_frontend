/* eslint-disable react/jsx-sort-default-props */
import React, { useMemo, useCallback } from 'react';
import createFocusOnFirstFieldDecorator from 'final-form-focus-on-first-field';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button, { ButtonColors } from '+components/Button';
import Form, { Controls, Field, FormRenderer, Validators, Parsers } from '+components/Form';
import NoData from '+components/NoData';
import { ScrollBarMixin } from '+components/ScrollBar';

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
  padding: 20px 0;
  overflow-x: hidden;
  overflow-y: scroll;

  ${ScrollBarMixin};
  
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
    case 'omero':
      return Controls.SelectOmeroImages;
    case 'channels':
      return Controls.SelectOmeroChannels;
    case 'int':
      return Controls.NumberField;
    case 'string':
    default:
      return Controls.TextField;
  }
};

const getFieldParser = (type) => {
  switch (type) {
    case 'omero':
      return Parsers.omeroIds;
    case 'channels':
      return Parsers.channels;
    default:
      return undefined;
  }
};

const getFieldAdditionalProps = (type, block) => {
  switch (type) {
    case 'omero':
      return { projectId: block.projectId };
    case 'channels':
      return { projectId: block.projectId, pipelineId: block.pipelineId };
    default:
      return {};
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

  const fields = useMemo(
    () => (Object.keys(block.params_meta || {}).reduce((acc, el) => {
      const { name, label, description, type, hidden, required } = block.params_meta[el];
      if (hidden) {
        return acc;
      }
      const param = {
        name: `params.${name}`,
        label: label || name,
        placeholder: description,
        type,
        required,
      };
      return { ...acc, [name]: param };
    }, {})),
    [block.params_meta],
  );

  const initialValues = useMemo(
    () => {
      return {
        id: block.id,
        name: block.name,
        projectId: block.projectId,
        pipelineId: block.pipelineId,
        rootId: block.rootId,
        params: {
          ...block.params,
          folder: block.folder,
          script: block.script,
          part: block.script_path,
        },
      };
    },
    [block],
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
              {Object.values(fields).length === 0 && (
                <NoData>No block params to display</NoData>
              )}
              {Object.values(fields).map((params) => (
                <Field
                  key={params.name}
                  name={params.name}
                  label={params.label}
                  placeholder={params.placeholder}
                  component={getFieldComponent(params.type)}
                  parse={getFieldParser(params.type)}
                  validate={params.required ? Validators.required : undefined}
                  {...getFieldAdditionalProps(params.type, block)}
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
    [onForm, className, header, fields, closeButtonText, submitButtonText, block, onClose],
  );

  return (
    <Form
      {...tail}
      initialValues={initialValues}
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
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    projectId: PropTypes.string,
    pipelineId: PropTypes.string,
    rootId: PropTypes.string,
    script_path: PropTypes.string,
    folder: PropTypes.string,
    script: PropTypes.string,
    params_meta: PropTypes.shape({}),
    params: PropTypes.shape({}),
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

