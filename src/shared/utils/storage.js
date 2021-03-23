const keys = ['getSessionStorage', 'sessionStorage'];
const listener = (event) => {
  if (!event?.newValue || !keys.includes(event?.key || '')) {
    return;
  }

  const token = sessionStorage.getItem('access_token');

  if (event.key === 'getSessionStorage') {
    if (token) {
      localStorage.setItem('sessionStorage', JSON.stringify({
        access_token: sessionStorage.getItem('access_token'),
        expires_at: sessionStorage.getItem('expires_at'),
      }));
      localStorage.removeItem('sessionStorage');
    }
    return;
  }

  if (token) {
    return;
  }

  try {
    const data = JSON.parse(event.newValue);
    Object
      .entries(data)
      .forEach(([key, value]) => sessionStorage.setItem(key, value));
    document.location.reload();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }
};

window.addEventListener('storage', listener, true);
localStorage.setItem('getSessionStorage', Math.random());
localStorage.removeItem('getSessionStorage');

export const getStorage = () => {
  // const local = +localStorage.getItem('rememberme') || 0;

  // return local ? localStorage : sessionStorage;

  return localStorage;
};

const base = {
  /**
   * @param {boolean} on
   */
  localIsPrimary(on) {
    localStorage.removeItem('rememberme');
    if (on) {
      localStorage.setItem('rememberme', 1);
    }
  },

  clearCredits() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('expires_at');
  },

  setItem(...args) {
    const [key, value] = args;

    const current = getStorage();

    if (key === 'access_token' && current === sessionStorage) {
      /**
       * setItem access_token is needed for catching changes in localStorage
       * if we work with sessionStorage, we don't add access_token to localStorage,
       * and other windows don't see changes if we do removeItem in {@link base.clearCredits}.
       */
      localStorage.setItem('access_token', value ? 'session' : '');
    }

    current.setItem(...args);
  },
};

// We check every 60 seconds to see if token has changed
let accessTokenCheck = +new Date();
let token = null;
const checkEvery = 6e4;

const getAccessToken = () => {
  const now = +new Date();
  const current = getStorage();

  if (!token || now - accessTokenCheck > checkEvery) {
    token = current.getItem('access_token');
    accessTokenCheck = now;
    return token;
  }

  return token;
};

const handler = {
  get(target, key) {
    /**
     * if target hase key return value from target (base)
     * @see base
     */
    if (key in target) {
      return target[key];
    }

    if (key === 'access_token') {
      return getAccessToken();
    }

    const current = getStorage();

    const value = current[key];
    if (typeof value === 'function') {
      return value.bind(current);
    }

    return value;
  },

  set(target, key, value) {
    // we don't change target (base) object.
    if (key in target) {
      return true;
    }

    if (key === 'access_token') {
      target.setItem(key, value);
      return true;
    }

    const current = getStorage();

    current[key] = value;

    return true;
  },

  has(target, key) {
    if (key in target) {
      return true;
    }

    const current = getStorage();

    return key in current;
  },

  ownKeys() {
    const current = getStorage();

    return Object.keys(current);
  },

  getOwnPropertyDescriptor: (target, key) => {
    const current = getStorage();

    return {
      value: current.getItem(key),
      enumerable: true,
      writable: true,
      configurable: true,
    };
  },

  deleteProperty: (target, key) => {
    if (key in target) {
      return false;
    }

    const current = getStorage();

    return current.removeItem(key);
  },
};

/**
 * @property {function()} clearCredits
 * @property {function(on)} localIsPrimary
 *
 * @property {number} length
 * @property {function(index): string} key
 * @property {function(key): string} getItem
 * @property {function(key, value)} setItem
 * @property {function(key)} removeItem
 * @property {function()} clear
 */
const storage = new Proxy(base, handler);

export default storage;
