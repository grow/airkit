/**
 * Creates a dom element and optionally adds a class name.
 * @param {string} tagName Element's tag name.
 * @param {string?} opt_className Class name to add.
 * @return {Element} Created element.
 */
function createDom(tagName, opt_className) {
  var element = document.createElement(tagName);
  if (opt_className) {
    element.className = opt_className;
  }
  return element;
}


module.exports = {
  createDom: createDom
};
