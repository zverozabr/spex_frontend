import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';

import Button, { ButtonColors } from '+components/Button';
import NoData from '+components/NoData';
import ThumbnailsViewer from '+components/ThumbnailsViewer';

import ButtonsContainer from './components/ButtonsContainer';
import Container from './components/Container';
import ManageImagesModal from './components/ManageImagesModal';
import PipelineContainer from './components/PipelineContainer';
import Row from './components/Row';
import ThumbnailsContainer from './components/ThumbnailsContainer';

const not = (a, b) => (a.filter((value) => b.indexOf(value) === -1));

const Project = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { projectId } = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      const projectId = pathArray[1] === PathNames.project && pathArray[2] ? `${pathArray[2]}` : undefined;
      return { projectId };
    },
    [location.pathname],
  );

  const project = useSelector(projectsSelectors.getProject(projectId));
  const { omeroIds = [] } = project || {};
  const thumbnails = useSelector(omeroSelectors.getThumbnails(projectId));
  const fixedThumbnails = useMemo(
    () => (Object.keys(thumbnails || {}).map((id) =>({ id: +id.toString(), img: thumbnails[id] }))),
    [thumbnails],
  );

  const [selectedThumbnails, setSelectedThumbnails] = useState([]);
  const [manageImagesModalOpen, setManageImagesModalOpen] = useState(false);

  const onRemoveImages = useCallback(
    () => {
      const newProject = {
        ...project,
        omeroIds: not(omeroIds, selectedThumbnails.map(String)),
      };
      dispatch(projectsActions.updateProject(newProject));
      setSelectedThumbnails([]);
    },
    [dispatch, omeroIds, project, selectedThumbnails],
  );

  const onPipelineAdd = useCallback(
    () => {
      // eslint-disable-next-line no-console
      console.log('onPipelineAdd');
    },
    [],
  );

  const onThumbnailClick = useCallback(
    (ids) => {
      setSelectedThumbnails(ids);
    },
    [],
  );

  const onManageImagesModalOpen = useCallback(
    () => { setManageImagesModalOpen(true); },
    [],
  );

  const onManageImagesClose = useCallback(
    () => { setManageImagesModalOpen(false); },
    [],
  );

  const onImagesChanged = useCallback(
    (values) => {
      setManageImagesModalOpen(false);
      const newProject = {
        ...project,
        omeroIds: values,
      };
      dispatch(projectsActions.updateProject(newProject));
    },
    [dispatch, project],
  );

  useEffect(
    () => {
      if (!omeroIds.length) {
        return;
      }
      dispatch(omeroActions.fetchThumbnails({ groupId: projectId, imageIds: omeroIds }));
    },
    [dispatch, omeroIds, omeroIds.length, projectId],
  );

  useEffect(
    () => {
      if (omeroIds.length === 0) {
        dispatch(omeroActions.clearThumbnails(projectId));
      }
    },
    [dispatch, omeroIds.length, projectId],
  );

  // useEffect(
  //   () => () => {
  //     dispatch(omeroActions.clearThumbnails(projectId));
  //   },
  //   [dispatch, projectId],
  // );

  return (
    <Container>
      <Row>
        <ButtonsContainer>
          <Button
            color={ButtonColors.danger}
            onClick={onRemoveImages}
            disabled={selectedThumbnails.length === 0}
          >
            Remove Selected
          </Button>
          <Button onClick={onManageImagesModalOpen}>
            Manage Images
          </Button>
        </ButtonsContainer>

        <ThumbnailsContainer>
          {fixedThumbnails.length === 0 && <NoData>No Images To Display</NoData>}
          {fixedThumbnails.length > 0 && (
            <ThumbnailsViewer
              thumbnails={fixedThumbnails}
              active={selectedThumbnails}
              onClick={onThumbnailClick}
              allowMultiSelect
              $size={1.5}
              $center
            />
          )}
        </ThumbnailsContainer>
      </Row>

      <Row>
        <ButtonsContainer>
          <Button onClick={onPipelineAdd}>
            Add Pipeline
          </Button>
        </ButtonsContainer>

        <PipelineContainer>
          Pipeline Will Be Here
        </PipelineContainer>
      </Row>

      {manageImagesModalOpen && (
        <ManageImagesModal
          header="Manage Images"
          open={manageImagesModalOpen}
          project={project}
          onClose={onManageImagesClose}
          onSubmit={onImagesChanged}
        />
      )}
    </Container>
  );
};

export default Project;
