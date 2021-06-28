import { call, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

import hash from '+utils/hash';

const initialState = {
  isFetching: false,
  error: '',
  tasks: {},
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/tasks';

const isObject = (value) => value != null && typeof value === 'object' && !Array.isArray(value);

const normalizeTask = (task) => {
  let content;
  try {
    content = JSON.parse(task.content);
  } catch(e) {
    content = {};
  }
  content = isObject(content) ? content : {};
  return { ...task, content };
};

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasks: startFetching,
    createTask: startFetching,
    updateTask: startFetching,
    deleteTask: startFetching,

    fetchTasksSuccess: (state, { payload: tasks }) => {
      stopFetching(state);
      const normalizedTasks = tasks.map(normalizeTask);
      state.tasks = hash(normalizedTasks || [], 'id');
    },

    updateTaskSuccess: (state, { payload: task }) => {
      stopFetching(state);
      state.tasks[task.id] = normalizeTask(task);
    },

    createTaskSuccess: (state, { payload: task }) => {
      stopFetching(state);
      state.tasks[task.id] = normalizeTask(task);
    },

    deleteTaskSuccess(state, { payload: id }) {
      stopFetching(state);
      delete state.tasks[id];
    },

    clearTasks: (state) => {
      state.tasks = {};
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancel: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchTasks]: {
      * saga() {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchTasksSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createTask]: {
      * saga({ payload: task }) {
        initApi();

        try {
          const url = `${baseUrl}`;
          const { data } = yield call(api.post, url, task);
          yield put(actions.createTaskSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.updateTask]: {
      * saga({ payload: task }) {
        initApi();

        try {
          const url = `${baseUrl}/${task.id}`;
          const { data } = yield call(api.put, url, task);
          yield put(actions.updateTaskSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deleteTask]: {
      * saga({ payload: id }) {
        initApi();

        try {
          const url = `${baseUrl}/${id}`;
          yield call(api.delete, url);
          yield put(actions.deleteTaskSuccess(id));
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

    getTasks: createSelector(
      [getState],
      (state) => state?.tasks,
    ),

    getTask: (id) => createSelector(
      [getState],
      (state) => state?.tasks[id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
