import SortView from '../view/sort-view';
import {sortOptions, Sort} from '../constants/sort-options';
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
  currentSortCallbacks = [];

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

      this.currentSortCallbacks.push((state) => state.toSorted(sortFunction));
    };
  }

  sortActions = {
    [Sort.DAY]: this.createSortAction('day', (previousPoint, nextPoint) => new Date(previousPoint.dateFrom) - new Date(nextPoint.dateFrom)),
    [Sort.TIME]: this.createSortAction('time', (previousPoint, nextPoint) =>
      ((new Date(nextPoint.dateTo) - new Date(nextPoint.dateFrom)) - (new Date(previousPoint.dateTo) - new Date(previousPoint.dateFrom)))
    ),
    [Sort.PRICE]: this.createSortAction('price', (previousPoint, nextPoint) => nextPoint.basePrice - previousPoint.basePrice)
  };

  #onSortClickHandler = (evt) => {

    const sortItem = evt.target.closest('.trip-sort__item');
    let currentFilter;
    if (sortItem) {
      currentFilter = sortItem.querySelector('.trip-sort__input');
      const currentFilterValue = currentFilter.value;
      if(currentFilterValue === Sort.EVENT || currentFilterValue === Sort.OFFER) {
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
