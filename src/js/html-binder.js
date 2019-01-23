export class HTMLBinder {

  constructor(obj, attr, values) {
    obj._bindings = {};

    let els = Array.prototype.slice.call(document.querySelectorAll(`[${attr}]`));
    els.forEach(el => {
        let bind = el.getAttribute(attr);
        console.log(1, bind)
        if (!bind) return;
        if (!obj._bindings[bind]) obj._bindings[bind] = [];
        obj._bindings[bind].push(el);
    })
    
    values.forEach(value => {
      let descriptor = {
        set: newValue => {
          obj[`_${value}`] = newValue;
          if (obj._bindings[value]) {
            obj._bindings[value].forEach(el => el.innerHTML = newValue);
          }
        },
        get: () => obj[`_${value}`]
      }
      Object.defineProperty(obj, value, descriptor)
    })
  }

}