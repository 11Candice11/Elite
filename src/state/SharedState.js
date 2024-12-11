// src/state/SharedState.js

export class SharedState {
  constructor() {
    this._state = {
      transactions: [],
      clientInfo: {},
    };
  }

  get transactions() {
    return this._state.transactions;
  }

  set transactions(value) {
    this._state.transactions = value;
  }

  get clientInfo() {
    return this._state.clientInfo;
  }

  set clientInfo(value) {
    this._state.clientInfo = value;
  }
}

export const sharedState = new SharedState();