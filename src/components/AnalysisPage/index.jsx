import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import PathNames from '@/models/PathNames';
import {
  actions as omeroActions,
  selectors as omeroSelectors,
} from '@/redux/api/omero';

import Accordion, { AccordionSummary, AccordionDetails } from '+components/Accordion';
import ImageViewer from '+components/ImageViewer';
import NoData from '+components/NoData';
import Tabs, { Tab, TabPanel } from '+components/Tabs';
import ThumbnailsViewer from '+components/ThumbnailsViewer';
import Typography from '+components/Typography';

import Container from './components/Container';
import DataContainer from './components/DataContainer';
import ImageViewerContainer from './components/ImageViewerContainer';
import LeftPanel from './components/LeftPanel';
import PipelineContainer from './components/PipelineContainer';
import RightPanel from './components/RightPanel';

const AnalysisPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const { projectId, datasetId, imageId } = useMemo(
    () => {
      const pathArray = location.pathname.split('/');
      const projectId = pathArray[1] === PathNames.project && pathArray[2] ? pathArray[2] : undefined;
      const datasetId = pathArray[3] === PathNames.dataset && pathArray[4] ? pathArray[4] : undefined;
      const imageId = pathArray[5] === PathNames.img && pathArray[6] ? pathArray[6] : undefined;
      return { projectId, datasetId, imageId };
    },
    [location.pathname],
  );

  const isOmeroFetching = useSelector(omeroSelectors.isFetching);

  const datasetImages = useSelector(omeroSelectors.getImages(datasetId));
  const datasetThumbnails = useSelector(omeroSelectors.getThumbnails(datasetId));
  const imageDetails = useSelector(omeroSelectors.getImageDetails(imageId));

  const [activeDataTab, setActiveDataTab] = useState(0);
  const [activePipelineTab, setActivePipelineTab] = useState(0);

  const datasetErrorMsg = useMemo(
    () => {
      switch (true) {
        case datasetId == null:
          return 'Select dataset to analyse';
        case datasetId >= 0 && (!datasetImages || !datasetThumbnails) && isOmeroFetching:
          return 'Dataset is loading...';
        case datasetId >= 0 && !datasetImages:
          return 'Dataset not found';
        case !datasetImages?.length && !isOmeroFetching:
          return 'Dataset is empty';
        default:
          return null;
      }
    },
    [datasetImages, datasetId, datasetThumbnails, isOmeroFetching],
  );

  const imageErrorMsg = useMemo(
    () => {
      switch (true) {
        case imageId == null:
          return 'Select image to analyse';
        case imageId >= 0 && !imageDetails && isOmeroFetching:
          return 'Image is loading...';
        case imageId >= 0 && !imageDetails:
          return 'Image not found';
        default:
          return null;
      }
    },
    [imageDetails, imageId, isOmeroFetching],
  );

  const hashDatasetImages = useMemo(
    () => (datasetImages || []).reduce((acc, el) => ({ ...acc, [el.id]: el }), {}),
    [datasetImages],
  );

  const thumbnails = useMemo(
    () => {
      return Object.keys(datasetThumbnails || {}).map((id) =>
        ({
          id,
          img: datasetThumbnails[id],
          title: hashDatasetImages[id].name,
        }));
    },
    [datasetThumbnails, hashDatasetImages],
  );

  const onPreviewClick = useCallback(
    (id) => {
      if (imageId !== id) {
        dispatch(omeroActions.clearImageDetails(imageId));
      }
      const url = `/${PathNames.project}/${projectId}/${PathNames.dataset}/${datasetId}/${PathNames.img}/${id}`;
      history.push(url);
    },
    [imageId, projectId, datasetId, history, dispatch],
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
      if (!datasetId || datasetImages?.length) {
        return;
      }
      dispatch(omeroActions.fetchImages(datasetId));
    },
    [dispatch, datasetId, datasetImages?.length],
  );

  useEffect(
    () => {
      if (!datasetImages?.length || Object.keys(datasetThumbnails || {}).length) {
        return;
      }
      const ids = datasetImages.map((item) => item.id);
      dispatch(omeroActions.fetchThumbnails({ datasetId, ids }));
    },
    [dispatch, datasetId, datasetImages, datasetThumbnails],
  );

  useEffect(
    () => () => {
      dispatch(omeroActions.clearImages(datasetId));
      dispatch(omeroActions.clearThumbnails(datasetId));
    },
    [dispatch, datasetId],
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
      dispatch(omeroActions.clearImageDetails(imageId));
    },
    [imageId, dispatch],
  );

  return (
    <Container>
      {datasetErrorMsg && <NoData>{datasetErrorMsg}</NoData>}

      {!datasetErrorMsg && (
        <Fragment>
          <LeftPanel>
            {!imageErrorMsg && (
              <Accordion>
                <AccordionSummary>{imageDetails.meta.imageName}</AccordionSummary>
                <AccordionDetails>
                  <Typography>Image ID:	{imageDetails.meta.imageId}</Typography>
                  <Typography>Dataset: {imageDetails.meta.datasetName}</Typography>
                  <Typography>Owner: {imageDetails.meta.imageAuthor}</Typography>
                  <Typography>Acquisition Date:	{imageDetails.acquisition_date}</Typography>
                  <Typography>Import Date:	{imageDetails.import_date}</Typography>
                  <Typography>Dimension (XY):	{imageDetails.size.width} x {imageDetails.size.height}</Typography>
                  <Typography>Pixels Type: {imageDetails.meta.pixelsType}</Typography>
                  <Typography>
                    Pixels Size (XYZ) ({imageDetails.pixel_size.symbol_z}):
                    {' '}
                    {imageDetails.pixel_size.x ? Number.parseFloat(imageDetails.pixel_size.x).toFixed(2) : '-'}
                    {' '}x{' '}
                    {imageDetails.pixel_size.y ? Number.parseFloat(imageDetails.pixel_size.y).toFixed(2) : '-'}
                    {' '}x{' '}
                    {imageDetails.pixel_size.z ? Number.parseFloat(imageDetails.pixel_size.z).toFixed(2) : '-'}
                  </Typography>
                  <Typography>Z-sections:	{imageDetails.size.z}</Typography>
                  <Typography>Timepoints:	{imageDetails.size.t}</Typography>
                  <Typography>Channels:	{imageDetails.channels.map(({ label }) => label).join(', ')}</Typography>
                </AccordionDetails>
              </Accordion>
            )}

            <ImageViewerContainer>
              {imageErrorMsg && <NoData>{imageErrorMsg}</NoData>}
              {!imageErrorMsg && <ImageViewer data={imageDetails} />}
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
                  thumbnails={thumbnails}
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
        </Fragment>
      )}
    </Container>
  );
};

export default AnalysisPage;
