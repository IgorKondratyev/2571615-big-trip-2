import AbstractView from '../framework/view/abstract-view.js';

function createFiltersTemplate(filters) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => `
        <div class="trip-filters__filter">
          <input id="filter-${filter.value}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter.value}" ${filter.checked ? 'checked' : ''}>
          <label class="trip-filters__filter-label" for="${filter.id}">${filter.label}</label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = [];
  #handleClick = null;

  constructor(filters, onClick) {
    super();
    this.#filters = filters;
    this.#handleClick = onClick;

    this.element.addEventListener('click', this.#filterHandler);
  }

  #filterHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick(evt);
  };

  get template() {
    return createFiltersTemplate(this.#filters);
  }
}
