/* eslint-disable react/no-array-index-key */
import React, { useCallback, useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions as jobsActions, selectors as jobsSelectors } from '@/redux/modules/jobs';

import Button, { ButtonColors } from '+components/Button';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '+components/Modal';
import { ScrollBarMixin } from '+components/ScrollBar';
import Tabs, { Tab, TabPanel } from '+components/Tabs';

const AddBlockForm = styled((props) => {
  const {
    className,
    header,
    open,
    onBlockClick,
    onClose,
  } = props;

  const dispatch = useDispatch();
  const jobTypes = useSelector(jobsSelectors.getJobTypes);
  // TODO: Remove me after debug
  console.log(jobTypes);
  const [activeDataTab, setActiveDataTab] = useState(0);

  const onDataTabChange = useCallback(
    (_, id) => {
      setActiveDataTab(id);
    },
    [],
  );

  useEffect(
    () => {
      dispatch(jobsActions.fetchJobTypes());
      return () => {
        dispatch(jobsActions.clearJobTypes());
      };
    },
    [dispatch],
  );

  return (
    <Modal
      className={className}
      open={open}
      onClose={onClose}
    >
      <ModalHeader>{header}</ModalHeader>

      <ModalBody>
        <Tabs value={activeDataTab} onChange={onDataTabChange}>
          {Object.values(jobTypes).map((type) => (<Tab key={type.name} label={type.name} />))}
        </Tabs>

        {Object.values(jobTypes).map((type, typeIndex) => (
          <TabPanel key={`${type.name}_${typeIndex}`} value={activeDataTab} index={typeIndex}>
            <Grid container>
              {Object.values(type.stages).map((stage, stageIndex) => (
                <Grid container key={`${stage.name}_${stageIndex}`}>
                  <Grid className="stage" item>
                    <div className="stage__name">{stageIndex === 0 ? 'Start' : stage.name}</div>
                  </Grid>
                  {stage.blocks.map((block, blockIndex) => (
                    <Grid
                      key={`${block.name}_${blockIndex}`}
                      className="block"
                      onClick={() => onBlockClick(block)}
                      item
                    >
                      <div className="block__name">{block.name}</div>
                      <div className="block__description">{block.description}</div>
                      <ul className="block__input">Input: {block.start_params.map((el, i) => <li key={i}>{el.description}</li>)}</ul>
                      <ul className="block__output">Output: {block.return.map((el, i) => <li key={i}>{el.description}</li>)}</ul>
                    </Grid>
                  ))}
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        ))}
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
  
  .stage {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 8px 0 4px 0;
    font-weight: bold;
    text-transform: uppercase;
    overflow: hidden;
    :after {
      content: '';
      flex: 1;
      margin-left: 1rem;
      height: 1px;
      background-color: #000;
    }
  }
  
  .block {
    display: flex;
    flex-direction: column;
    width: calc((100% / 4) - 15px);
    height: 150px;
    max-height: 150px;
    margin-right: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    background-color: lightgrey;
    cursor: pointer;
    padding: 10px;
    overflow-x: hidden;
    ${ScrollBarMixin};
    
    :hover {
      transform: scale(1.04);
    }
    
    &__name {
      font-weight: bold;
    }

    &__description {
      margin: 8px 0;
      font-size: 0.8em;
      width: 100%;
    }

    &__input {
      margin-top: auto;
    }

    &__output {
      margin-top: 8px;
    }

    &__input, &__output {
      padding: unset;
      font-size: 0.8em;
      opacity: 0.8;
      
      li {
        margin-left: 6px;
        &::marker {
          content: '-';
        }
      }
    }
  }
`;

AddBlockForm.propTypes = {
  className: PropTypes.string,
  header: PropTypes.string,
  open: PropTypes.bool,
  onBlockClick: PropTypes.func,
  onClose: PropTypes.func,
};

AddBlockForm.defaultProps = {
  className: '',
  header: '',
  open: false,
  onBlockClick: () => {},
  onClose: () => {},
};

export default AddBlockForm;
