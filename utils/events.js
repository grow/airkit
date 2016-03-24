/**
 * Adds an event listener to an element where the event target
 * is discovered by moving up the clicked element's descendants.
 * @param {Element} el Element to host the listener.
 * @param {string} type Listener type.
 * @param {function} listener Listener function.
 */
function addDelegatedListener(el, type, listener) {
  return el.addEventListener(type, function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    target = target.nodeType === 3 ? target.parentNode : target;
    do {
      listener(target);
      if (target.parentNode) {
        target = target.parentNode;
      }
    } while (target.parentNode);
  });
}


module.exports = {
  addDelegatedListener: addDelegatedListener
};
