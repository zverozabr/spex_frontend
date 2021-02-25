import axios from 'axios';
import { CANCEL } from 'redux-saga';

import storage from '+utils/storage';

// un-authenticated function
let unAuthAction;

/*
 * backend is now returning 403s for READONLY users attempting to perform an update.
 * This is problematic, because we have not yet removed all of the UI that allows
 * users to attempt to perform updates.  Let them be, but kick a message that they
 * are unauthorized to do so
 * TL;DR: 403 - OK, but not allowed.  401 - auth issue, so auto-logout
 */
// const unAuthStatuses = [401, 403];
const unAuthStatuses = [401];

const resolve = (res) => res;
const reject = (error) => {
  let retError = error;

  if (axios.isCancel(error)) {
    // eslint-disable-next-line no-console
    console.warn(error.message);
  }

  // error of type Network Error has no response key
  if (error.response) {
    const { status, data } = error.response;

    // Logout if backend request failed auth
    if (unAuthStatuses.includes(+status) && unAuthAction) {
      unAuthAction('You have been logged out automatically');
    }

    retError = data?.message ? new Error(data.message) : error;
  }

  return Promise.reject(retError);
};

const {
  REACT_APP_BACKEND_URL_ROOT,
} = process.env;

axios.defaults.baseURL = REACT_APP_BACKEND_URL_ROOT;

const CancelToken = () => ({
  cancel: () => null,
});

const wrapHttpWithCancellation = (httpMethod, arity) => {
  return function (...args) {
    const inCancelToken = args[arity] || CancelToken();

    if (!inCancelToken) {
      return httpMethod(...args);
    }

    const url = args[0];
    const reqConfig = args[arity - 1] || {};

    const cancelToken = new axios.CancelToken((cancelFn) => {
      const { cancel } = inCancelToken;
      inCancelToken.cancel = (...args2) => {
        const cancelFeedback = {
          message: 'Request is cancelled!',
          url,
          payload: args2,
        };
        cancel(cancelFeedback);
        cancelFn(`Cancelled HTTP call to ${url}`);
      };
    });

    const request = httpMethod.apply(null, [
      ...args.slice(0, arity - 1),
      {
        ...reqConfig,
        cancelToken,
      },
    ]);
    request[CANCEL] = () => inCancelToken.cancel();

    return request;
  };
};

/**
 * instantiate axios
 * @param config - axios config [details](https://github.com/axios/axios#request-config)
 */
const backendClient = (config = {}) => {
  // if (!unAuthAction) {
  //   throw new Error('Backed client is not configured, use configureBackendClient');
  // }

  let newConfig = config;

  const jwtToken = storage.access_token;

  if (jwtToken) {
    newConfig = {
      ...newConfig,
      headers: {
        ...(newConfig.headers || {}),
        Authorization: `Bearer ${jwtToken}`,
      },
    };
  }

  const instance = axios.create(newConfig);
  // intercept un-authenticated requests, and log the user out if unauthorized.
  instance.interceptors.response.use(resolve, reject);

  // Modify HTTP methods to allow cancellation with a token
  const { request, get, put, post, patch, head, options } = instance;
  const del = instance.delete.bind(instance);

  return {
    request: wrapHttpWithCancellation(request, 1),
    get: wrapHttpWithCancellation(get, 2),
    delete: wrapHttpWithCancellation(del, 2),
    head: wrapHttpWithCancellation(head, 2),
    options: wrapHttpWithCancellation(options, 2),
    put: wrapHttpWithCancellation(put, 3),
    post: wrapHttpWithCancellation(post, 3),
    patch: wrapHttpWithCancellation(patch, 3),
    CancelToken,
  };
};

backendClient.CancelToken = CancelToken;

export default backendClient;
