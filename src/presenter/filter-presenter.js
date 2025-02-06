import FiltersView from '../view/filters-view.js';
import {render, replace} from '../framework/render.js';
import {filters, Filter} from '../constants/filters.js';

export default class FilterPresenter {

  #container;
  #userActionsHandler;
  #filtersComponent = null;
  #prevFiltersComponent = null;
  #filters = filters;
  #currentFilter;

  currentFilterMessage = [];
  currentFilterCallback = [(state) => state];

  #getEmptyFilters = (state) => {
    const allFilteredState = {
      everything: state,
      future: state.filter((point) => new Date(point.dateFrom) > new Date()),
      present: state.filter((point) => (new Date(point.dateFrom) < new Date()) && (new Date(point.dateTo) > new Date())),
      past: state.filter((point) => new Date(point.dateTo) < new Date())
    };
    const emptyFilters = Object.entries(allFilteredState).reduce((acc, [key, value]) => {
      if(value.length === 0) {
        acc.push(key);
      }
      return acc;
    }, []);
    return emptyFilters;
  };

  #emptyFilters = [];

  renderFilters(state) {

    if(state) {
      this.#emptyFilters = this.#getEmptyFilters(state);
      this.#filters.forEach((filter) => {
        filter['disabled'] = (this.#emptyFilters.includes(filter.value));
      });
    }


    this.#filtersComponent = new FiltersView(this.#filters, this.#onFilterClickHandler);

    if(this.#prevFiltersComponent === null) {
      render(this.#filtersComponent, this.#container);
    } else {
      replace(this.#filtersComponent, this.#prevFiltersComponent);
    }
    this.#prevFiltersComponent = this.#filtersComponent;
  }

  updateFilters = (selectedValue = Filter.EVERYTHING) => {
    this.#filters.forEach((filter) => {
      filter['checked'] = (filter.value === selectedValue);
    });
  };

  #filterActions = {
    everything: () => {
      this.#currentFilter = Filter.EVERYTHING;
      this.currentFilterMessage.push('Click New Event to create your first point');
      this.updateFilters(Filter.EVERYTHING);
      this.currentFilterCallback.push((state) => state);
    },
    future: () => {
      this.#currentFilter = Filter.FUTURE;
      this.currentFilterMessage.push('There are no future events now');
      this.updateFilters(Filter.FUTURE);
      this.currentFilterCallback.push((state) => state.filter((point) => new Date(point.dateFrom) > new Date()));
    },
    present: () => {
      this.#currentFilter = Filter.PRESENT;
      this.currentFilterMessage.push('There are no present events now');
      this.updateFilters(Filter.PRESENT);
      this.currentFilterCallback.push((state) => state.filter((point) => (new Date(point.dateFrom) < new Date()) && (new Date(point.dateTo) > new Date())));
    },
    past: () => {
      this.#currentFilter = Filter.PAST;
      this.currentFilterMessage.push('There are no past events now');
      this.updateFilters(Filter.PAST);
      this.currentFilterCallback.push((state) => state.filter((point) => new Date(point.dateTo) < new Date()));
    }
  };

  #onFilterClickHandler = (evt) => {

    const sortItem = evt.target.closest('.trip-filters__filter');
    if (sortItem) {
      const currentFilter = sortItem.querySelector('.trip-filters__filter-input').value;
      if(this.#emptyFilters.includes(currentFilter)) {
        return;
      }
      if(currentFilter !== this.#currentFilter) {
        const action = this.#filterActions[currentFilter];
        action();
        this.#userActionsHandler('FILTER', 'MAJOR', null);
      }

    }

  };

  constructor (container, userActionsHandler) {
    this.#container = container;
    this.#userActionsHandler = userActionsHandler;
  }

  init() {
    this.renderFilters();
  }

}
