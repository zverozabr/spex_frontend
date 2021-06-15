/* eslint-disable react/jsx-sort-default-props */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button, { ButtonColors } from '+components/Button';
import Form, { FormRenderer } from '+components/Form';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';

/**
 * Form modal dialog.
 */
const FormModal = styled((props) => {
  const {
    className,
    header,
    children,
    initialValues,
    closeButtonText,
    submitButtonText,
    open,
    onClose,
    onSubmit,
  } = props;

  const render = useCallback(
    ({ handleSubmit, form, submitting, pristine }) => (
      <Modal
        className={className}
        open={open}
        onClose={(event) => {
            form.reset();
            onClose(event);
        }}
      >
        <FormRenderer
          onSubmit={async (event) => {
              const error = await handleSubmit(event);
              if (error) {
                return error;
              }
              form.reset();
          }}
        >
          <ModalHeader>{header}</ModalHeader>
          <ModalBody>{children}</ModalBody>
          <ModalFooter>
            <Button
              color={ButtonColors.secondary}
              onClick={(event) => {
                form.reset();
                onClose(event);
              }}
            >
              {closeButtonText}
            </Button>
            <Button
              type="submit"
              color={ButtonColors.primary}
              disabled={submitting || pristine}
            >
              {submitButtonText}
            </Button>
          </ModalFooter>
        </FormRenderer>
      </Modal>
    ),
    [children, className, closeButtonText, header, onClose, open, submitButtonText],
  );

  return (
    <Form
      initialValues={initialValues}
      render={render}
      onSubmit={onSubmit}
    />
  );
})`
  ${ModalBody} {
    .MuiFormControl-root ~ .MuiFormControl-root {
      margin-top: 14px;
    }
  }
`;

FormModal.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.string,
  /**
   * Modal title.
   */
  header: PropTypes.string,
  /**
   * Form fields.
   */
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
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
   * Callback fired when the component requests to be closed. .
   */
  onClose: PropTypes.func,
  /**
   * A callback fired when confirm button clicked.
   */
  onSubmit: PropTypes.func,
};

FormModal.defaultProps = {
  className: '',
  header: '',
  children: null,
  initialValues: null,
  closeButtonText: 'Cancel',
  submitButtonText: 'Submit',
  open: false,
  onClose: () => {},
  onSubmit: () => {},
};

export default FormModal;
