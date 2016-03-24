/**
 * @fileoverview Utility functions for CSS classes.
 */


/**
 * Removes a list of classes and adds new ones.
 */
function removeAdd(el, classesToRemove, classesToAdd) {
  el.classList.remove.apply(el.classList, classesToRemove);
  el.classList.add.apply(el.classList, classesToAdd);
}


/**
 * Enables a class based on a condition.
 */
function enable(el, className, enabled) {
  if (enabled) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}


module.exports = {
  enable: enable,
  removeAdd: removeAdd
};
