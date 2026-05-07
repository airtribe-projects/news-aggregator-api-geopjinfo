import { AsyncLocalStorage } from 'node:async_hooks';

const requestContextStorage = new AsyncLocalStorage();

const runWithRequestContext = (context, callback) => requestContextStorage.run(context, callback);

const getRequestContext = () => requestContextStorage.getStore() || {};

const setRequestContext = (updates) => {
  const currentContext = requestContextStorage.getStore();
  if (!currentContext) {
    return updates;
  }

  Object.assign(currentContext, updates);
  return currentContext;
};

export {
  runWithRequestContext,
  getRequestContext,
  setRequestContext,
};