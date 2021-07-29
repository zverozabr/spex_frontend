import { call, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching, current } from '@/redux/utils';

import hash from '+utils/hash';

const initialState = {
  isFetching: false,
  error: '',
  pipelines: [],
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/pipeline';

const slice = createSlice({
  name: 'pipelines',
  initialState,
  reducers: {
    fetchPipelines: startFetching,
    createPipeline: startFetching,
    createBox: startFetching,
    updatePipeline: startFetching,
    deletePipeline: startFetching,

    fetchPipelinesSuccess: (state, { payload: { projectId, data } }) => {
      stopFetching(state);
      const hashedPipelines = hash(data || [], 'id');
      if (JSON.stringify(hashedPipelines) === JSON.stringify( { } ) ) {
        state.pipelines[projectId] = [];
      } else {
        state.pipelines[projectId] = hashedPipelines;
      }
    },

    updatePipelineSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      state.pipelines[pipeline.id] = pipeline;
    },

    createPipelineSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      const hashedKey = hash([pipeline] || [], 'id');
      state.pipelines[pipeline.project] = { ...state.pipelines[pipeline.project], ...hashedKey };
    },

    createBoxSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      const hashedKey = hash([pipeline] || [], 'id');
      state.pipelines[pipeline.project] = { ...state.pipelines[pipeline.project], ...hashedKey };
    },

    deletePipelineSuccess(state, { payload: [projectId, pipelineId] }) {
      stopFetching(state);
      delete state.pipelines[projectId][pipelineId];
    },

    clearPipelines: (state) => {
      state.pipelines = {};
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancel: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchPipelines]: {
      * saga({ payload: projectId }) {
        initApi();

        try {
          const url = `${baseUrl}/${projectId}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchPipelinesSuccess({ projectId: projectId, data: data.data['pipelines'] }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createPipeline]: {
      * saga({ payload: pipeline }) {
        initApi();

        try {
          const url = `${baseUrl}/create/${pipeline.project}`;
          const { data } = yield call(api.post, url, pipeline);
          yield put(actions.createPipelineSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createBox]: {
      * saga({ payload: pipeline }) {
        initApi();

        try {
          const url = `${baseUrl}/box/${pipeline[0]}/${pipeline[1]}`;
          const { data } = yield call(api.post, url, { 'name': 'Box', 'project': pipeline[0] });
          // eslint-disable-next-line no-console
          console.log(current(this.state));
          yield put(actions.createBoxSuccess([pipeline[0], pipeline[1], data.data]));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.updatePipeline]: {
      * saga({ payload: pipeline }) {
        initApi();

        try {
          const url = `${baseUrl}/${pipeline.id}`;
          const { data } = yield call(api.put, url, pipeline);
          yield put(actions.updatePipelineSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deletePipeline]: {
      * saga({ payload: [projectId, pipelineId] }) {
        initApi();
        try {
          const url = `${baseUrl}/delete/${projectId}/${pipelineId}`;
          yield call(api.delete, url);
          yield put(actions.deletePipelineSuccess([projectId, pipelineId]));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },
  }),

  selectors: (getState) => ({
    isFetching: createSelector(
      [getState],
      (state) => state?.isFetching,
    ),

    getPipelines: (projectId) => createSelector(
      [getState],
      (state) => state?.pipelines[projectId],
    ),

    getPipeline: (projectId, id) => createSelector(
      [getState],
      (state) => state?.pipelines[projectId][id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
