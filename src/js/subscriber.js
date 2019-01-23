export class Subscriber {

  constructor(obj) {
    obj.subscribers = {};

    obj.subscribe = (event, callback) => {
        if (!obj.subscribers[event]) obj.subscribers[event] = [];

        obj.subscribers[event].push(callback);
    }

    obj.publish = (event, data) => {
        if (!obj.subscribers[event] || !obj.subscribers[event].length) return;

        obj.subscribers[event].forEach(callback => callback(data));
    }
  }

}