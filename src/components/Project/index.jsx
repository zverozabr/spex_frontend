import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { actions as projectsActions, selectors as projectsSelectors } from '@/redux/modules/projects';

import Button, { ButtonColors } from '+components/Button';
import ClickAwayListener from '+components/ClickAwayListener';
import Grow from '+components/Grow';
import MenuItem from '+components/MenuItem';
import MenuList from '+components/MenuList';
import NoData from '+components/NoData';
import Paper from '+components/Paper';
import Popper from '+components/Popper';
import ThumbnailsViewer from '+components/ThumbnailsViewer';

import ButtonsContainer from './components/ButtonsContainer';
import Container from './components/Container';
import FormModalManageImages from './components/FormModalManageImages';
import ManageJobsModal from './components/ManageJobsModal';
import ManageResourcesModal from './components/ManageResourcesModal';
import PipelineContainer from './components/PipelineContainer';
import Row from './components/Row';
import ThumbnailsContainer from './components/ThumbnailsContainer';

const not = (a, b) => (a.filter((value) => b.indexOf(value) === -1));

const Project = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const projectId = useMemo(
    () => {
      const match = matchPath(pathname, { path: `/${PathNames.projects}/:id` });
      return match ? match.params.id : undefined;
    },
    [pathname],
  );

  const project = useSelector(projectsSelectors.getProject(projectId));
  const thumbnails = useSelector(omeroSelectors.getThumbnails(projectId));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [selectedThumbnails, setSelectedThumbnails] = useState([]);
  const [manageImagesModalOpen, setManageImagesModalOpen] = useState(false);
  const [manageJobsModalOpen, setManageJobsModalOpen] = useState(false);
  const [manageResourcesModalOpen, setManageResourcesModalOpen] = useState(false);

  const omeroIds = useMemo(
    () => (project?.omeroIds || []),
  [project],
  );

  const normalizedThumbnails = useMemo(
    () => (Object.keys(thumbnails || {}).map((id) =>({ id, img: thumbnails[id] }))),
    [thumbnails],
  );

  const onToggle = useCallback(
    () => {
      setOpen((prevOpen) => !prevOpen);
    },
    [setOpen],
  );

  const onToggleClose = useCallback(
    (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    },
    [setOpen],
  );

  const onKeyDownInMenu = useCallback(
    (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        setOpen(false);
      }
    },
    [setOpen],
  );

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
    () => {
      setManageImagesModalOpen(true);
    },
    [],
  );

  const onManageImagesModalClose = useCallback(
    () => {
      setManageImagesModalOpen(false);
    },
    [],
  );

  const onManageImagesModalSubmit = useCallback(
    (values) => {
      setManageImagesModalOpen(false);
      const omeroIds = values.omeroIds.map((el) => el.id || el);
      const updateData = { ...values, omeroIds };
      dispatch(projectsActions.updateProject(updateData));
    },
    [dispatch],
  );

  const onManageJobsModalOpen = useCallback(
    () => { setManageJobsModalOpen(true); },
    [],
  );

  const onManageJobsClose = useCallback(
    () => { setManageJobsModalOpen(false); },
    [],
  );

  const onJobsChanged = useCallback(
    (values) => {
      setManageJobsModalOpen(false);
    },
    [],
  );

  const onManageResourcesModalOpen = useCallback(
    () => { setManageResourcesModalOpen(true); },
    [],
  );

  const onManageResourcesClose = useCallback(
    () => { setManageResourcesModalOpen(false); },
    [],
  );

  const onResourcesChanged = useCallback(
    (values) => {
      setManageResourcesModalOpen(false);
    },
    [],
  );

  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(
    () => {
      if (omeroIds.length === 0) {
        dispatch(omeroActions.clearThumbnails(projectId));
      }

      if (omeroIds.length > 0) {
        dispatch(omeroActions.fetchThumbnails({ groupId: projectId, imageIds: omeroIds }));
      }

      return () => {
        dispatch(omeroActions.clearThumbnails(projectId));
      };
    },
    [dispatch, omeroIds, projectId],
  );

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
          <Button
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={onToggle}
          >
            Manage
          </Button>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={onToggleClose}>
                    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={onKeyDownInMenu}>
                      <MenuItem onClick={onManageImagesModalOpen}>Images</MenuItem>
                      <MenuItem onClick={onManageJobsModalOpen}>Jobs</MenuItem>
                      <MenuItem onClick={onManageResourcesModalOpen}>Resources</MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
          {/* <Button onClick={onManageImagesModalOpen}>
            Manage items
          </Button> */}
        </ButtonsContainer>

        <ThumbnailsContainer>
          {normalizedThumbnails.length === 0 && <NoData>No Images To Display</NoData>}
          {normalizedThumbnails.length > 0 && (
            <ThumbnailsViewer
              thumbnails={normalizedThumbnails}
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
        <FormModalManageImages
          header="Manage Images"
          initialValues={{ ...project, omeroIds: normalizedThumbnails }}
          onClose={onManageImagesModalClose}
          onSubmit={onManageImagesModalSubmit}
          open
        />
      )}

      {manageJobsModalOpen && (
        <ManageJobsModal
          header="Manage Jobs"
          project={project}
          onClose={onManageJobsClose}
          onSubmit={onJobsChanged}
          open
        />
      )}

      {manageResourcesModalOpen && (
        <ManageResourcesModal
          header="Manage Resources"
          project={project}
          onClose={onManageResourcesClose}
          onSubmit={onResourcesChanged}
          open
        />
      )}
    </Container>
  );
};

export default Project;
