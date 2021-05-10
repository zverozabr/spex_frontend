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
    open,
    children,
    closeButtonText,
    submitButtonText,
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
      onSubmit={onSubmit}
      render={render}
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
   * If true, the modal is open.
   */
  open: PropTypes.bool,
  /**
   * Form fields.
   */
  children: PropTypes.oneOfType([ PropTypes.node, PropTypes.object, PropTypes.func ]),
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

FormModal.defaultProps = {
  className: '',
  header: '',
  open: false,
  children: null,
  closeButtonText: 'Chancel',
  submitButtonText: 'Submit',
  onClose: () => {},
  onSubmit: () => {},
};

export default FormModal;
