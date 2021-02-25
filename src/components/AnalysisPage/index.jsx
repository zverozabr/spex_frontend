import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import {
  actions as omeroActions,
  selectors as omeroSelectors,
} from '@/redux/api/omero';

import ImageViewer from '+components/ImageViewer';
import Tabs, { Tab, TabPanel } from '+components/Tabs';
import ThumbnailsViewer from '+components/ThumbnailsViewer';

import Container from './components/Container';
import DataContainer from './components/DataContainer';
import ImageViewerContainer from './components/ImageViewerContainer';
import LeftPanel from './components/LeftPanel';
import NoDataContainer from './components/NoDataContainer';
import PipelineContainer from './components/PipelineContainer';
import RightPanel from './components/RightPanel';

const AnalysisPage = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const datasetId = useMemo(
    () => {
      const search = new URLSearchParams(location.search);
      return search.get('dataset');
    },
    [location.search],
  );

  const [imageId, setImageId] = useState();
  const [activeDataTab, setActiveDataTab] = useState(0);
  const [activePipelineTab, setActivePipelineTab] = useState(0);

  const datasetDetails = useSelector(omeroSelectors.getDatasetDetails(datasetId));
  const datasetThumbnails = useSelector(omeroSelectors.getDatasetThumbnails(datasetId));
  const imageDetails = useSelector(omeroSelectors.getImageDetails(imageId));

  const onPreviewClick = useCallback(
    (id) => {
      if (imageId !== id) {
        dispatch(omeroActions.clearImageDetails(imageId));
      }
      setImageId(id);
    },
    [imageId, dispatch],
  );

  const onDataTabChange = useCallback(
    (_, id) => {
      setActiveDataTab(id);
    },
    [],
  );

  const onPipelineTabChange = useCallback(
    (_, id) => {
      setActivePipelineTab(id);
    },
    [],
  );

  useEffect(
    () => {
      if (datasetDetails || !datasetId) {
        return;
      }
      dispatch(omeroActions.fetchDatasetDetails(datasetId));
    },
    [dispatch, datasetId, datasetDetails],
  );

  useEffect(
    () => {
      if (!datasetDetails?.images || datasetThumbnails) {
        return;
      }
      const ids = datasetDetails.images.map((item) => item['@id']);
      dispatch(omeroActions.fetchDatasetThumbnails({ datasetId, ids }));
    },
    [dispatch, datasetId, datasetDetails?.images, datasetThumbnails],
  );

  useEffect(
    () => {
      if (!imageId) {
        return;
      }
      dispatch(omeroActions.fetchImageDetails(imageId));
    },
    [imageId, dispatch],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearDatasetDetails(datasetId));
      dispatch(omeroActions.clearDatasetThumbnails(datasetId));
    },
    [dispatch, datasetId],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearImageDetails(imageId));
    },
    [imageId, dispatch],
  );

  return (
    <Container>
      <LeftPanel>
        <ImageViewerContainer>
          {imageId && (
            <ImageViewer data={imageDetails} />
          )}
          {!imageId && (
            <NoDataContainer>
              Select image to analyse
            </NoDataContainer>
          )}
        </ImageViewerContainer>
      </LeftPanel>

      <RightPanel>
        <DataContainer>
          <Tabs value={activeDataTab} onChange={onDataTabChange}>
            <Tab label="Images" />
            <Tab label="Data Tables" />
          </Tabs>
          <TabPanel value={activeDataTab} index={0}>
            <ThumbnailsViewer
              thumbnails={datasetThumbnails || []}
              active={imageId}
              onClick={onPreviewClick}
            />
          </TabPanel>
          <TabPanel value={activeDataTab} index={1}>
            Data Tables
          </TabPanel>
        </DataContainer>

        <PipelineContainer>
          <Tabs value={activePipelineTab} onChange={onPipelineTabChange}>
            <Tab label="Preprocess" />
            <Tab label="Segment" />
            <Tab label="Phenotype" />
            <Tab label="Spatial Analysis" />
          </Tabs>
          <TabPanel value={activePipelineTab} index={0}>
            Preprocess
          </TabPanel>
          <TabPanel value={activePipelineTab} index={1}>
            Segment
          </TabPanel>
          <TabPanel value={activePipelineTab} index={2}>
            Phenotype
          </TabPanel>
          <TabPanel value={activePipelineTab} index={3}>
            Spatial Analysis
          </TabPanel>
        </PipelineContainer>
      </RightPanel>
    </Container>
  );
};

export default AnalysisPage;
