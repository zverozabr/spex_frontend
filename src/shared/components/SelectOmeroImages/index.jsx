import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { actions as omeroActions, selectors as omeroSelectors } from '@/redux/modules/omero';
import { selectors as projectsSelectors } from '@/redux/modules/projects';
import TransferList from '+components/TransferList';

const SelectOmeroImages = (props) => {
  const { projectId, ...tail } = props;

  const dispatch = useDispatch();

  const project = useSelector(projectsSelectors.getProject(projectId));
  const projectThumbnails = useSelector(omeroSelectors.getThumbnails(projectId));
  const projectImages = useMemo(
    () => (Object.keys(projectThumbnails || {}).map((id) => ({ id, img: projectThumbnails[id] }))),
    [projectThumbnails],
  );

  useEffect(
    () => {
      const projectImageIds = project?.omeroIds || [];
      if (projectImageIds.length) {
        dispatch(omeroActions.fetchThumbnails({ groupId: projectId, imageIds: projectImageIds }));
      }
      return () => {
        dispatch(omeroActions.clearThumbnails(projectId));
      };
    },
    [dispatch, projectId, project?.omeroIds],
  );

  return (
    <TransferList {...tail} options={projectImages} />
  );
};

SelectOmeroImages.propTypes = {
  projectId: PropTypes.string,
};
SelectOmeroImages.defaultProps = {
  projectId: '',
};

export default SelectOmeroImages;
