import { formatDate, formatTime, formatDuration } from '../utils/date-utils.js';
import AbstractView from '../framework/view/abstract-view.js';

function createPointTemplate(point) {
  const { basePrice, dateFrom, dateTo, isFavorite, pointOffers, type, destination } = point;

  const formattedDate = formatDate(dateFrom);
  const startTime = formatTime(dateFrom);
  const endTime = formatTime(dateTo);
  const durationFormatted = formatDuration(dateFrom, dateTo);

  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `
    <li class="trip-events__item">

        <div class="event">

            <time class="event__date" datetime="${dateFrom}">${formattedDate}</time>

            <div class="event__type">
                <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
            </div>

            <h3 class="event__title">${type.charAt(0).toUpperCase() + type.slice(1)} ${destination.name} </h3>

            <div class="event__schedule">
                <p class="event__time">
                    <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
                </p>
                <p class="event__duration">${durationFormatted}</p>
            </div>

            <p class="event__price">
                &euro;&nbsp;<span class="event__price-value">${(+basePrice).toFixed(2)}</span>
            </p>

            <h4 class="visually-hidden">pointOffers:</h4>
            ${pointOffers && pointOffers.length > 0 ? `<ul class="event__selected-pointOffers">
                ${pointOffers
    .filter((offer)=>offer.isChecked)
    .map((offer) => `<li class="event__offer">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                </li>`).join('')}
            </ul>` : ''}

            <button class="event__favorite-btn ${favoriteClass}" type="button">
                <span class="visually-hidden">Add to favorite</span>
                <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                </svg>
            </button>

            <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
            </button>

        </div>
    </li>
    `;
}
export default class PointView extends AbstractView {

  #point = {};
  #handleEditClick = null;
  #handleFavoriteButtonClick = null;

  constructor({point, onEditClick, onFavoriteButtonClick}) {
    super();
    this.#point = point;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteButtonClick = onFavoriteButtonClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);

    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteBtnClickHandler);
  }

  get template() {
    return createPointTemplate(this.#point);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteButtonClick(this.#point);
  };
}
