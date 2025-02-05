import SortView from '../view/sort-view';
import {sortOptions, SORTS} from '../constants/sort-options';
import {render, replace} from '../framework/render.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';

export default class SortPresenter {

  #container = null;
  #sortComponent = null;
  #prevSortComponent = null;
  #sortOptions = sortOptions;
  #userActionsHandler;
  #currentSort;
  currentSortCallback = [];

  init() {
    this.renderSort();
  }

  renderSort() {

    this.#sortComponent = new SortView(this.#sortOptions, this.#onSortClickHandler);

    if(this.#prevSortComponent === null) {
      render(this.#sortComponent, this.#container);
    } else {
      replace(this.#sortComponent, this.#prevSortComponent);
    }
    this.#prevSortComponent = this.#sortComponent;
  }

  updateSortOptions(selectedKey) {
    for (const key of Object.keys(this.#sortOptions.isChecked)) {
      this.#sortOptions.isChecked[key] = (key === selectedKey);
    }
  }

  createSortAction(sortKey, sortFunction) {
    return () => {
      this.#currentSort = `sort-${sortKey}`;

      this.updateSortOptions(sortKey);

      this.currentSortCallback.push((state) => state.toSorted(sortFunction));
    };
  }

  sortActions = {
    [SORTS.DAY]: this.createSortAction('day', (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)),
    [SORTS.TIME]: this.createSortAction('time', (a, b) =>
      ((new Date(b.dateTo) - new Date(b.dateFrom)) - new Date(a.dateTo) - new Date(a.dateFrom))
    ),
    [SORTS.PRICE]: this.createSortAction('price', (a, b) => b.basePrice - a.basePrice)
  };

  #onSortClickHandler = (evt) => {

    const sortItem = evt.target.closest('.trip-sort__item');
    let currentFilter;
    if (sortItem) {
      currentFilter = sortItem.querySelector('.trip-sort__input');
      const currentFilterValue = currentFilter.value;
      if(currentFilterValue === SORTS.EVENT || currentFilterValue === SORTS.OFFER) {
        return;
      }
      if(currentFilterValue !== this.#currentSort) {
        this.sortActions[currentFilterValue]();
        this.#userActionsHandler(UserAction.SORT, UpdateType.MINOR, null);
      }
    }

  };

  constructor (container, userActionsHandler) {
    this.#container = container;
    this.#userActionsHandler = userActionsHandler;
  }

}
