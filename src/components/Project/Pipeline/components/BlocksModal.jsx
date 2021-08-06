import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Blocks from '@/models/Blocks';

import Button, { ButtonColors } from '+components/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';

const blocks = Object.values(Blocks);

const BlocksModal = styled((props) => {
  const {
    className,
    header,
    open,
    onBlockClick,
    onClose,
  } = props;

  return (
    <Modal
      className={className}
      open={open}
      onClose={onClose}
    >
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        <Grid container>
          {blocks.map((block) => (
            <Grid
              key={block.value}
              className="block"
              onClick={() => onBlockClick(block.value)}
              item
            >
              <span className="block__label">{block.label}</span>
              <span className="block__description">{block.description}</span>
              <span className="block__input">Input: {block.input}</span>
              <span className="block__output">Output: {block.output}</span>
            </Grid>
          ))}
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          color={ButtonColors.secondary}
          onClick={onClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
})`
  .modal-content {
    width: 100%;
    max-width: 960px;
  }
  
  .block {
    display: flex;
    flex-direction: column;
    width: calc((100% / 3) - 15px);
    height: 150px;
    margin-right: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    background-color: lightgrey;
    overflow: hidden;
    cursor: pointer;
    padding: 10px;
    
    :hover {
      transform: scale(1.04);
    }
    
    &__label {
      font-weight: bold;
      font-size: 1.2em;
    }

    &__description {
      margin-top: 8px;
    }

    &__input {
      margin-top: auto;
    }

    &__input, &__output {
      font-size: 0.8em;
      opacity: 0.8;
    }
  }
`;

BlocksModal.propTypes = {
  className: PropTypes.string,
  header: PropTypes.string,
  open: PropTypes.bool,
  onBlockClick: PropTypes.func,
  onClose: PropTypes.func,
};

BlocksModal.defaultProps = {
  className: '',
  header: '',
  open: false,
  onBlockClick: () => {},
  onClose: () => {},
};

export default BlocksModal;
