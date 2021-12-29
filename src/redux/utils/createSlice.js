import { createSlice as createToolkitSlice } from '@reduxjs/toolkit';
import { call, put, race, take, takeEvery } from 'redux-saga/effects';

const getCancelType = (type, token) => `${type}${token ? `_${token}` : ''}`;

const wrapWithNamespace = (cancelType, module) => {
  return {
    ...module,
    actions: Object.keys(module.actions)
      .reduce((acc, key) => {
        const { type } = module.actions[key];
        // if action is cancel action and cancel action has a payload then concat payload to type, otherwise just send the action type with optional namespace
        const wrapped = (payload, namespace) => ({
          type: type === cancelType && !!payload ? `${type}_${payload}` : type,
          payload,
          namespace,
        });
        wrapped.type = type;
        wrapped.toString = () => type;

        acc[key] = wrapped;

        return acc;
      }, {}),
  };
};

const clearState = (initialState) => () => {
  return initialState;
};

/**
 * @callback SagaGenerator
 * @param {{ payload: Object, type: string }} action
 */

/**
 * @typedef {Object} Saga
 * @property {SagaGenerator} saga
 * @property {function} [taker=takeEvery] - one of takeEvery (by default), takeLatest, takeMaybe
 * }
 */

/**
 * @typedef {{ watcher: Generator }} SagaWatcher
 */

/**
 * @typedef {SagaGenerator|Saga|SagaWatcher} SagaObject
 */


/**
 * @callback SelectorsFactory
 *
 * Factory for generation selectors for slice
 *
 * @param {function(any): any} getState - method for get the current state for slice
 * @return {Object} collection of selectors
 *
 * @example
 * ```
 * createSlice({
 *  // ...
 *  selectors: (getState) => ({
 *    getFirstTodo: createSelector(
 *      [getState],
 *      (state) => state[0],
 *    ),
 *  })
 * })
 * ```
 */


/**
 * @callback SagasFactory
 *
 * @param {Object} actions - collection of actions, keys are names of reducers
 * @param {Object} selectors - collection of selectors
 * @return {Object} - collection of {@link SagaObject}s
 *
 * @example
 * ```
 * (actions, selectors) => ({
 *   [actions.someActionName]: {
 *     * saga({ payload }) {
 *       // do something
 *       yield call(api.get, someUrl, payload);
 *     }
 *   },
 *   * [actions.anotherActionName]: saga({ payload }) {
 *     // do something
 *     yield call(api.get, someUrl, payload);
 *   },
 *   watchLoginCycle: {
 *     * watcher() {
 *       while (true) {
 *         yield take('LOGIN_ACTION');
 *         // do login stuff...
 *         yield take('LOGOUT_ACTION');
 *         // do logout stuff...
 *       }
 *     }
 *   }
 * })
 * ```
 */

/**
 * Function to create a redux "duck" module by reusing redux toolkit's createSlice.
 * Motivation behind "duck" is to reduce unnecessary redux
 * boilerplate as actions, types, reducers, and async actions are tightly coupled
 * anyway. Adding helper functions also reduces repetitive information, "don't repeat yourself".
 *
 * @param {Object} options - params for createSlice function
 * @param {Object} options.initialState - initial state
 * @param {string} options.name - slice name
 * @param {Object} options.reducers - collection of reducers, name of reducers will be used for creating actions
 * @param {SagasFactory} [options.sagas] - collection of sagas, see example
 * @param {SelectorsFactory} [options.selectors] - factory for generation of selectors collection
 * @return {{selectors: {getState: function(*): *}, actions: *}}
 *
 * @see {@link https://github.com/erikras/ducks-modular-redux}
 * @see {@link https://redux.js.org/redux-toolkit/overview}
 *
 * @example
 * ```
 * import { takeEvery, takeLatest, call, put } from 'redux-saga/effects'
 *
 * export default createSlice({
 *    name: 'todos',
 *    initialState: [],
 *    reducers: {
 *      addTodo(state, action) {
 *        state.push(action.payload);
 *      }
 *    },
 *    sagas: (actions, selectors) => ({
 *      // the computed object key is possible because redux toolkit adds
 *      // a .toString() for the action function
 *      [actions.addTodo]: {
 *        * saga(action) {
 *          // For the action addTodo, on every action make the API call.
 *          yield put(Api.postTodo, action.payload);
 *        },
 *        // takeLatest will cancel previous fetch if a new addTodo was received
 *        // by default if omitted, taker will be takeEvery
 *        taker: takeLatest
 *      },
 *    }),
 *    selectors: (getState) => ({
 *      getFirstTodo: createSelector(
 *        [getState],
 *        (state) => state[0],
 *      ),
 *    })
 * })
 *
 *
 * // If you need fine grained control of the watcher saga, you can can use the
 * // 'watcher' object key instead of 'saga'. This will ignore the taker and saga
 * // and insert your watcher directly in the module.sagas array. The name of the
 * // watcher saga need not be tied to any action.
 *
 * sagas: (actions, selectors) => ({
 *   watchLoginCycle: {
 *     * watcher() {
 *       while (true) {
 *         yield take('LOGIN_ACTION');
 *         // do login stuff...
 *         yield take('LOGOUT_ACTION');
 *         // do logout stuff...
 *       }
 *     }
 *   }
 * })
 * ```
 */
export const createSlice = (options) => {
  const { sagas, reducers, selectors, ...sliceOpts } = options;
  const hasCancel = !!reducers?.cancel;

  const stateIdentity = (s) => s;
  const sliceWithCancel = {
    ...sliceOpts,
    reducers: {
      ...(reducers || {}),
      cancel: reducers?.cancel || stateIdentity,
      clear: reducers?.clear || clearState(sliceOpts.initialState ?? {}),
    },
  };

  const toolkitSlice = createToolkitSlice(sliceWithCancel);
  const cancelType = toolkitSlice.actions.cancel.type;
  const wrappedSlice = wrapWithNamespace(cancelType, toolkitSlice);

  // Add default selector
  const getState = (state) => state[sliceOpts.name];
  const scopedSelectors = selectors?.(getState) || {};

  const newSlice = {
    ...wrappedSlice,
    selectors: {
      getState,
      ...scopedSelectors,
    },
  };

  // Handle Sagas option for slice
  if (sagas) {
    const sagasWithContext = sagas(newSlice.actions, newSlice.selectors);

    /**
     * @param {string} actionType
     * @param {SagaObject} sagaObj
     * @return {(function(): Generator<*, void, *>)|*}
     */
    const map = ([actionType, sagaObj]) => {
      let saga;
      let taker;

      // For some reason regenerator runtime wasn't generating Generators for all generating functions?
      // So require to check if typeof sagaObj is function instead
      if (typeof sagaObj === 'function') {
        saga = sagaObj;
        taker = takeEvery;
      } else if ('watcher' in sagaObj) {
        return sagaObj.watcher;
      } else {
        // eslint-disable-next-line prefer-destructuring
        saga = sagaObj.saga;
        taker = sagaObj.taker || takeEvery;
      }

      return function* () {
        yield taker(actionType, function* (action) {
          const { namespace: token = '' } = action;
          const cancelActionType = getCancelType(cancelType, token);

          yield race({
            task: call(saga, action),
            cancel: call(function* () {
              yield take(cancelActionType);

              if (hasCancel) {
                // It is true only for calling with namespace.
                yield put({
                  type: cancelType,
                  payload: token,
                });
              }

              return true;
            }),
          });
        });
      };
    };

    newSlice.sagas = Object.entries(sagasWithContext).map(map);
  }

  return newSlice;
};

export default createSlice;
