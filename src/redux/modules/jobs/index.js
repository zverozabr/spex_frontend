import { call, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

import hash from '+utils/hash';

const initialState = {
  isFetching: false,
  error: '',
  jobs: {},
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/jobs';

const isObject = (value) => value != null && typeof value === 'object' && !Array.isArray(value);

const normalizeJob = (job) => {
  let content;
  try {
    content = JSON.parse(job.content);
  } catch(e) {
    content = {};
  }
  content = isObject(content) ? content : {};
  return { ...job, content };
};

const slice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    fetchJobs: startFetching,
    createJob: startFetching,
    updateJob: startFetching,
    deleteJob: startFetching,

    fetchJobsSuccess: (state, { payload: jobs }) => {
      stopFetching(state);
      const normalizedJobs = jobs.map(normalizeJob);
      state.jobs = hash(normalizedJobs || [], 'id');
    },

    updateJobSuccess: (state, { payload: job }) => {
      stopFetching(state);
      state.jobs[job.id] = normalizeJob(job);
    },

    createJobSuccess: (state, { payload: job }) => {
      stopFetching(state);
      state.jobs[job.id] = normalizeJob(job);
    },

    deleteJobSuccess(state, { payload: id }) {
      stopFetching(state);
      delete state.jobs[id];
    },

    clearJobs: (state) => {
      state.jobs = {};
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancel: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchJobs]: {
      * saga() {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchJobsSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createJob]: {
      * saga({ payload: job }) {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.post, url, job);
          yield put(actions.createJobSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.updateJob]: {
      * saga({ payload: job }) {
        initApi();

        try {
          const url = `${baseUrl}/${job.id}`;
          const { data } = yield call(api.put, url, job);
          yield put(actions.updateJobSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deleteJob]: {
      * saga({ payload: id }) {
        initApi();

        try {
          const url = `${baseUrl}/${id}`;
          yield call(api.delete, url);
          yield put(actions.deleteJobSuccess(id));
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

    getJobs: createSelector(
      [getState],
      (state) => state?.jobs,
    ),

    getJob: (id) => createSelector(
      [getState],
      (state) => state?.jobs[id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
