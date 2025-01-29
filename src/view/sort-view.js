import AbstractView from '../framework/view/abstract-view.js';

function createSortTemplate(sortOptions) {
  const {
    sortByDay = 'Day',
    sortByEvent = 'Event',
    sortByTime = 'Time',
    sortByPrice = 'Price',
    sortByOffer = 'Offers',
    isChecked = {
      day: true,
      event: false,
      time: false,
      price: false,
      offer: false
    }
  } = sortOptions;

  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      <div class="trip-sort__item trip-sort__item--day">
        <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-day" ${isChecked.day ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-day">${sortByDay}</label>
      </div>

      <div class="trip-sort__item trip-sort__item--event">
        <input id="sort-event" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled ${isChecked.event ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-event">${sortByEvent}</label>
      </div>

      <div class="trip-sort__item trip-sort__item--time">
        <input id="sort-time" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-time" ${isChecked.time ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-time">${sortByTime}</label>
      </div>

      <div class="trip-sort__item trip-sort__item--price">
        <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-price" ${isChecked.price ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-price">${sortByPrice}</label>
      </div>

      <div class="trip-sort__item trip-sort__item--offer">
        <input id="sort-offer" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled ${isChecked.offer ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-offer">${sortByOffer}</label>
      </div>
    </form>
  `;
}

export default class SortView extends AbstractView {

  #sortOptions = {};
  #handleClick = null;

  constructor(sortOptions, onClick) {
    super();
    this.#sortOptions = sortOptions;
    this.#handleClick = onClick;

    this.element.addEventListener('click', this.#sortClickHandler);
  }

  #sortClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick(evt);
  };

  get template() {
    return createSortTemplate(this.#sortOptions);
  }
}
