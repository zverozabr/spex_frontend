import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  actions as imagesActions,
  selectors as imagesSelectors,
} from '@/redux/api/images';

import ImageList from '+components/ImageList';
import ImageViewer from '+components/ImageViewer';
import Tabs, { Tab, TabPanel } from '+components/Tabs';

import Container from './components/Container';
import DataContainer from './components/DataContainer';
import ImageViewerContainer from './components/ImageViewerContainer';
import LeftPanel from './components/LeftPanel';
import NoDataContainer from './components/NoDataContainer';
import PipelineContainer from './components/PipelineContainer';
import RightPanel from './components/RightPanel';

const Layout = () => {
  const dispatch = useDispatch();

  const [imageViewerContainerElem, setImageViewerContainerElem] = useState();
  const [activeDataTab, setActiveDataTab] = useState(0);
  const [activePipelineTab, setActivePipelineTab] = useState(0);
  const [activeImageId, setActiveImageId] = useState();

  const previews = useSelector(imagesSelectors.getPreviews);
  const activeImage = useSelector(imagesSelectors.getImage(activeImageId));

  const onPreviewClick = (newValue) => {
    const { id } = newValue;
    setActiveImageId(id);
  };

  const onDataTabChange = (event, newValue) => {
    setActiveDataTab(newValue);
  };

  const onPipelineTabChange = (event, newValue) => {
    setActivePipelineTab(newValue);
  };

  useEffect(
    () => {
      if (previews.length > 0) {
        return;
      }
      dispatch(imagesActions.fetchPreviews());
    },
    [ dispatch, previews.length ],
  );

  useEffect(
    () => {
      if (activeImage) {
        return;
      }
      dispatch(imagesActions.fetchImage(activeImageId));
    },
    [ dispatch, activeImage, activeImageId ],
  );

  return (
    <Container>
      <LeftPanel>
        <ImageViewerContainer ref={setImageViewerContainerElem}>
          {activeImage && (
            <ImageViewer
              container={imageViewerContainerElem}
              images={[activeImage]}
              visible
              noClose
              noNavbar
              noImgDetails
              rotatable={false}
              scalable={false}
              showTotal={false}
            />
          )}
          {!activeImage && (
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
            <ImageList
              images={previews}
              value={activeImageId}
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

export default Layout;
