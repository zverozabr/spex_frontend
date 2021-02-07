import { put, cancelled } from 'redux-saga/effects';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';

const fakeData = {
  1: { id: 1, src: 'https://wallpaperaccess.com/full/17520.jpg' },
  2: { id: 2, src: 'https://wallpaperaccess.com/full/39608.jpg' },
  3: { id: 3, src: 'https://i.pinimg.com/originals/b7/4b/2d/b74b2dfeca58f0955c51876c24fcf227.jpg' },
};

const initialState = {
  isFetching: false,
  previews: {},
  images: {},
  error: '',
};

let api;

const initApi = () => {
  if (!api) {
    api = '';
  }
};

const slice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    fetchPreviews: startFetching,
    fetchImage: startFetching,

    fetchPreviewsSuccess: (state, { payload: { data } }) => {
      stopFetching(state);
      state.previews = (data || {});
    },

    fetchImageSuccess: (state, { payload: { id, data } }) => {
      stopFetching(state);
      if (!data) {
        return;
      }
      state.images[id] = data;
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancelled: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchPreviews]: {
      * saga() {
        initApi();

        try {
          // const { data } = yield call(api.get, '/api/v1/previews');
          const data = fakeData;

          yield put(actions.fetchPreviewsSuccess({ data }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // yield put(toastActions.error({
          //   message: 'Error fetching previews',
          //   details: error.message,
          // }));
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },

    [actions.fetchImage]: {
      * saga({ payload: id }) {
        initApi();

        try {
          // const { data } = yield call(api.get, `/api/v1/images/${id}`);
          const data = fakeData[id];

          yield put(actions.fetchImageSuccess({ id, data }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // yield put(toastActions.error({
          //   message: 'Error fetching images',
          //   details: error.message,
          // }));
        } finally {
          if (yield cancelled()) {
            yield put(actions.cancelled());
          }
        }
      },
    },
  }),

  selectors: (getState) => ({
    getPreviews: createSelector(
      [getState],
      (state) => Object.values(state?.previews) || [],
    ),
    getImage: (id) => createSelector(
      [getState],
      (state) => state?.images[id],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
