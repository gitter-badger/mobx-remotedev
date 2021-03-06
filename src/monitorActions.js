import mobx from 'mobx';
import { stringify, parse } from 'jsan';
import { setValue } from './utils';

export const isMonitorAction = (store) => store.__isRemotedevAction === true;

function dispatchRemotely(store, { type, arguments: args }) {
  if (!store[type]) {
    console.error(`Function '${type}' doesn't exist`);
    return;
  }
  store[type](...args);
}

export const dispatchMonitorAction = (store, devTools) => {
  let intermValue;
  const initValue = mobx.toJS(store);
  devTools.init(initValue);

  return (message) => {
    if (message.type === 'DISPATCH') {
      switch (message.payload.type) {
        case 'RESET':
          setValue(store, initValue);
          devTools.init(initValue);
          return;
        case 'COMMIT':
          intermValue = mobx.toJS(store);
          devTools.init(intermValue);
          return;
        case 'ROLLBACK':
          setValue(store, intermValue);
          devTools.init(intermValue);
          return;
        case 'JUMP_TO_STATE':
          setValue(store, parse(message.state));
          return;
      }
    } else if (message.type === 'ACTION') {
      dispatchRemotely(store, message.payload);
    }
  };
};
