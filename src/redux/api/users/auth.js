import { call, cancelled, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { createSelector, createSlice, startFetching, stopFetching } from '@/redux/utils';
import storage from '+utils/storage';

const initialState = {
  isFetching: false,
  isAuthenticated: !!storage.access_token,
  error: '',
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/omero';

const slice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    login(state) {
      startFetching(state);
      storage.clearCredits();
      state.isAuthenticated = false;
    },

    logout(state) {
      storage.clearCredits();
      state.isAuthenticated = false;
    },

    loginSuccess(state, { payload: { Authorization } }) {
      stopFetching(state);
      storage.setItem('access_token', Authorization);
      state.isAuthenticated = true;
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancelled: stopFetching,
  },

  sagas: (actions) => ({
    [actions.login]: {
      * saga({ payload }) {
        initApi();

        try {
          const url = `${baseUrl}/login`;
          const { login, password } = payload;
          const user = { login, password };
          const { data } = yield call(api.post, url, user);
          yield put(actions.loginSuccess(data));
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

    isAuthenticated: createSelector(
      [getState],
      (state) => state?.isAuthenticated,
    ),
  }),
});

export const { actions, selectors } = slice;

export default slice;
