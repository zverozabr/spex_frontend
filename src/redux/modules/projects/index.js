import { call, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

const initialState = {
  isFetching: false,
  error: '',
  projects: [],
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/projects';

const slice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjects: startFetching,
    createProject: startFetching,
    deleteProject: startFetching,

    fetchProjectsSuccess: (state, { payload: { projects } }) => {
      stopFetching(state);
      state.projects = (projects || []);
    },

    createProjectSuccess: (state, { payload: { project } }) => {
      stopFetching(state);
      // TODO: Put project to projects
      // eslint-disable-next-line no-console
      console.log({ project });
      // state.projects = (projects || []);
    },

    deleteProjectSuccess(state, { payload: id }) {
      stopFetching(state);
      // TODO: Remove project from projects
      // eslint-disable-next-line no-console
      console.log({ id });
      // delete state.projects[id];
    },

    clearProjects: (state) => {
      state.projects = [];
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancel: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchProjects]: {
      * saga() {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchProjectsSuccess(data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createProject]: {
      * saga({ payload: project }) {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.post, url, project);
          yield put(actions.createProjectSuccess(data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deleteProject]: {
      * saga({ payload: id }) {
        initApi();

        try {
          const url = `${baseUrl}/${id}`;
          yield call(api.delete, url);
          yield put(actions.deleteProjectSuccess(id));
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

    getProjects: createSelector(
      [getState],
      (state) => state?.projects,
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
