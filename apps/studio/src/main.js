(function bootStudio(namespace) {
  const els = namespace.getElements();
  const store = namespace.createStore(namespace.createDemoProject());

  function render() {
    namespace.renderStudio(els, store);
    namespace.bindDynamicInteractions(els, store, render);
  }

  const playback = namespace.createPlayback(store, render);
  namespace.bindInteractions(els, store, playback, render);
  render();
})(window.MatryStudio = window.MatryStudio || {});
