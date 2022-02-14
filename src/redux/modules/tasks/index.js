import { call, put, all } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

import hash from '+utils/hash';

const initialState = {
  isFetching: false,
  error: '',
  tasks: {},
  images: {},
  taskKeys: {},
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
    fetchTasksByIds: startFetching,
    fetchTasks: startFetching,
    fetchTaskImage: startFetching,
    fetchTaskKeys: startFetching,
    createTask: startFetching,
    updateTask: startFetching,
    deleteTask: startFetching,

    fetchTasksSuccess: (state, { payload: tasks }) => {
      stopFetching(state);
      const normalizedTasks = (Array.isArray(tasks) ? tasks : []).map(normalizeTask);
      state.tasks = hash(normalizedTasks, 'id');
    },

    fetchTaskImageSuccess: (state, { payload: { id, image } }) => {
      stopFetching(state);
      state.images[id] = image;
    },

    fetchTaskKeysSuccess: (state, { payload: task }) => {
      stopFetching(state);
      state.tasks[task.id] = normalizeTask(task);
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

    clearTaskImage: (state, { payload: id }) => {
      if (!id) {
        return;
      }
      delete state.images[id];
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
          const { data: { data } } = yield call(api.get, url);
          yield put(actions.fetchTasksSuccess(data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.fetchTasksByIds]: {
      * saga({ payload: ids }) {
        initApi();

        try {
          const url = `${baseUrl}/list`;
          const { data: { data } } = yield call(api.post, url, { ids });
          yield put(actions.fetchTasksSuccess(data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.fetchTaskImage]: {
      * saga({ payload: id }) {
        initApi();

        try {
          const url = `${baseUrl}/image/${id}`;
          const { data: { data: { image } } } = yield call(api.get, url);
          yield put(actions.fetchTaskImageSuccess({ id, image }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.fetchTaskKeys]: {
      * saga({ payload: id }) {
        initApi();

        try {
          const url_keys = `${baseUrl}/file/${id}`;
          const url_tasks = `${baseUrl}/${id}`;

          const [
            { data: { data: keys } },
            { data: { data: task } },
          ] = yield all([
            call(api.get, url_keys),
            call(api.get, url_tasks),
          ]);
          task.keys = keys;
          yield put(actions.fetchTaskKeysSuccess(task));
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
          const { data: { data } } = yield call(api.post, url, task);
          yield put(actions.createTaskSuccess(data));
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
          const { data: { data } } = yield call(api.put, url, task);
          yield put(actions.updateTaskSuccess(data));
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
      (state) => state?.tasks?.[id],
    ),

    getTaskImage: (id) => createSelector(
      [getState],
      (state) => state?.images?.[id],
    ),

    getTaskKeys: (id) => createSelector(
      [getState],
      (state) => state?.taskKeys?.[id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
