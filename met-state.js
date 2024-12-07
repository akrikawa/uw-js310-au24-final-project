// https://dev.to/chovy/state-management-into-its-own-module-in-vanilla-javascript-58mf
// https://medium.com/@asierr/back-to-basics-mastering-state-management-in-vanilla-javascript-e3be7377ac46
// https://dev.to/parenttobias/a-simple-observer-in-vanilla-javascript-1m80
// https://webdevstudios.com/2019/02/19/observable-pattern-in-javascript/

// Subject class.
class Subject {
  constructor() {
    this.observers = [];
  }

  // Similar to addObserver.
  subscribe(observer) {
    this.observers.push(observer);
  }
  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }
  notify(data) {
    if (this.observers.length > 0) {
      this.observers.forEach((observer) => observer.update(data));
    }
  }
}

// Observer class.
class Observer {
  update() {}
}

// AppState class. This is what we'll use to manage state in our app.
class State extends Subject {
  constructor() {
    super();
    this.state = {};
  }

  update(data = {}) {
    // Reference for Object.assign() - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    this.state = Object.assign(this.state, data);
    this.notify(this.state);
  }

  get() {
    return this.state;
  }
}
