// https://dev.to/chovy/state-management-into-its-own-module-in-vanilla-javascript-58mf
// https://medium.com/@asierr/back-to-basics-mastering-state-management-in-vanilla-javascript-e3be7377ac46
// https://dev.to/parenttobias/a-simple-observer-in-vanilla-javascript-1m80

class ApplicationState {
  constructor() {
    this.state = {};
    this.observers = [];
  }

  setState(key, value) {
    this.state[key] = value;
    // this.notify(key, value);
  }
  getState(key) {
    return this.state[key];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }
  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }
  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class Observer {
  update(data) {}
}
