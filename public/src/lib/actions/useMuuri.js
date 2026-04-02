import Muuri from 'muuri';

let muuriInstance = null;

export function useMuuri(node, options = {}) {
  const {
    onReorder = () => {},
    dragEnabled = true,
    dragPredicate = null
  } = options;

  let container = node;

  function init() {
    if (!container || muuriInstance) return;

    muuriInstance = new Muuri(container, {
      items: '.muuri-item',
      dragEnabled,
      dragStartPredicate: dragPredicate || function(e, t) {
        const element = e.getElement();
        const target = t.target;

        if (
          element.classList.contains('editing') ||
          element.classList.contains('is-details-visible') ||
          target.closest('.shortcode-hp') ||
          target.closest('.shortcode-count') ||
          target.closest('.shortcode-stat') ||
          target.closest('.card-actions-top') ||
          target.closest('.card-content .title') ||
          target.closest('.card-content .content')
        ) {
          return false;
        }

        const rect = element.getBoundingClientRect();
        const clientX = t.srcEvent?.clientX || t.clientX;
        const clientY = t.srcEvent?.clientY || t.clientY;

        return (
          (clientX - rect.left < 15 ||
            rect.right - clientX < 15 ||
            clientY - rect.top < 15 ||
            rect.bottom - clientY < 15) &&
          Muuri.ItemDrag.defaultStartPredicate(e, t)
        );
      },
      layout: {
        fillGaps: true
      }
    });

    muuriInstance.on('dragEnd', () => {
      const items = muuriInstance.getItems();
      const ids = items.map(item => item.getElement().dataset.id);
      onReorder(ids);
    });
  }

  function addItems(elements) {
    if (!muuriInstance || !elements.length) return;
    muuriInstance.add(elements);
  }

  function removeItems(elements) {
    if (!muuriInstance || !elements.length) return;
    const items = elements.map(el => muuriInstance.getItem(el)).filter(Boolean);
    muuriInstance.remove(items, { removeElements: true });
  }

  function setItems(newElements) {
    if (!muuriInstance || !newElements.length) {
      if (muuriInstance) {
        muuriInstance.remove(muuriInstance.getItems(), { removeElements: true });
      }
      return;
    }

    const currentItems = muuriInstance.getItems();
    const currentIds = new Set(currentItems.map(item => item.getElement().dataset.id));
    const newIds = new Set(newElements.map(el => el.dataset.id).filter(Boolean));

    const toRemove = currentItems.filter(item => !newIds.has(item.getElement().dataset.id));
    if (toRemove.length) {
      muuriInstance.remove(toRemove, { removeElements: true });
    }

    const toAdd = newElements.filter(el => !currentIds.has(el.dataset.id));
    if (toAdd.length) {
      muuriInstance.add(toAdd);
    }

    const sortedIds = newElements.map(el => el.dataset.id).filter(Boolean);
    muuriInstance.sort((a, b) => {
      return sortedIds.indexOf(a.getElement().dataset.id) - sortedIds.indexOf(b.getElement().dataset.id);
    }, { layout: 'instant' });
  }

  function refreshLayout() {
    if (muuriInstance) {
      muuriInstance.layout(true);
    }
  }

  function destroy() {
    if (muuriInstance) {
      muuriInstance.destroy();
      muuriInstance = null;
    }
  }

  init();

  return {
    addItems,
    removeItems,
    setItems,
    refreshLayout,
    destroy,
    getInstance: () => muuriInstance
  };
}

export function createMuuriItem(element) {
  return element;
}
