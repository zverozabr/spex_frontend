import { all, call, put, cancelled } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

const initialState = {
  isFetching: false,
  datasets: [],
  datasetsDetails: {},
  datasetsThumbnails: {},
  imagesDetails: {},
  error: '',
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const slice = createSlice({
  name: 'omero',
  initialState,
  reducers: {
    fetchDatasets: startFetching,
    fetchDatasetDetails: startFetching,
    fetchDatasetThumbnails: startFetching,
    fetchImageDetails: startFetching,

    fetchDatasetsSuccess: (state, { payload: { data } }) => {
      stopFetching(state);
      state.datasets = (data || []);
    },

    fetchDatasetDetailsSuccess: (state, { payload: { id, details, images } }) => {
      stopFetching(state);
      const data = {
        ...details,
        images,
      };
      state.datasetsDetails[id] = (data || {});
    },

    fetchDatasetThumbnailsSuccess: (state, { payload: { id, data } }) => {
      stopFetching(state);
      state.datasetsThumbnails[id] = (data || {});
    },

    fetchImageDetailsSuccess: (state, { payload: { id, data } }) => {
      stopFetching(state);
      state.imagesDetails[id] = (data || {});
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancelled: stopFetching,

    clearDatasetDetails: (state, { payload: id }) => {
      if (!id) {
        return;
      }
      delete state.datasetsDetails[id];
    },

    clearDatasetThumbnails: (state, { payload: id }) => {
      if (!id) {
        return;
      }
      delete state.datasetsThumbnails[id];
    },

    clearImageDetails: (state, { payload: id }) => {
      if (!id) {
        return;
      }
      delete state.imagesDetails[id];
    },
  },

  sagas: (actions) => ({
    [actions.fetchDatasets]: {
      * saga() {
        initApi();
        // eslint-disable-next-line no-console
        console.info('fetchDatasets');
        try {
          const url = 'http://idr.openmicroscopy.org/api/v0/m/datasets';
          const { data } = yield call(api.get, url);
          yield put(actions.fetchDatasetsSuccess({ data: data.data }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },

    [actions.fetchDatasetDetails]: {
      * saga({ payload: id }) {
        initApi();
        // eslint-disable-next-line no-console
        console.info('fetchDatasetDetails', id);
        try {
          const detailsUrl = `http://idr.openmicroscopy.org/api/v0/m/datasets/${id}`;
          // TODO: Make offset and limit as props
          const imagesUrl = `${detailsUrl}/images?offset=50&limit=20`;

          const [ details, images ] = yield all([
            call(api.get, detailsUrl),
            call(api.get, imagesUrl),
          ]);

          yield put(actions.fetchDatasetDetailsSuccess({
            id,
            details: details.data.data,
            images: images.data.data,
          }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },

    [actions.fetchDatasetThumbnails]: {
      * saga({ payload: { datasetId, ids } }) {
        initApi();
        // eslint-disable-next-line no-console
        console.info('fetchDatasetThumbnails', datasetId, ids);
        try {
          const url = 'http://idr.openmicroscopy.org/webclient/get_thumbnails';
          const urlWithParams = `${url}/?${ids.map((id) => `id=${id}`).join('&')}`;
          const { data } = yield call(api.get, urlWithParams);
          yield put(actions.fetchDatasetThumbnailsSuccess({ id: datasetId, data }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },

    [actions.fetchImageDetails]: {
      * saga({ payload: id }) {
        initApi();
        // eslint-disable-next-line no-console
        console.info('fetchImageDetails', id);
        try {
          const url = 'http://idr.openmicroscopy.org/iviewer/image_data';
          const urlWithParams = `${url}/${id}`;
          const { data } = yield call(api.get, urlWithParams);
          yield put(actions.fetchImageDetailsSuccess({ id, data }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },
  }),

  selectors: (getState) => ({
    isFetching: createSelector(
      [getState],
      (state) => state?.isFetching,
    ),

    getDatasets: createSelector(
      [getState],
      (state) => state?.datasets,
    ),

    getDatasetDetails: (id) => createSelector(
      [getState],
      (state) => state?.datasetsDetails[id],
    ),

    getDatasetImagesDetails: (id) => createSelector(
      [getState],
      (state) => {
        if (state?.datasetsDetails[id]) {
          const { images } = state?.datasetsDetails[id];
          return images.reduce((acc, el) => ({ ...acc, [el['@id']]: el }), {});
        }
        return undefined;
      },
    ),

    getDatasetThumbnails: (id) => createSelector(
      [getState],
      (state) => state?.datasetsThumbnails[id],
    ),

    getImageDetails: (id) => createSelector(
      [getState],
      (state) => state?.imagesDetails[id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;