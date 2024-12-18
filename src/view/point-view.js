import {createElement} from '../render.js';
import { formatDate, formatTime, formatDuration } from '../utils/date-utils.js';

function createPointTemplate(point) {
  const { basePrice, dateFrom, dateTo, isFavorite, offers, type, destination } = point;

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
                &euro;&nbsp;<span class="event__price-value">${(basePrice / 100).toFixed(2)}</span>
            </p>

            <h4 class="visually-hidden">Offers:</h4>
            ${offers && offers.length > 0 ? `<ul class="event__selected-offers">
                ${offers.map((offer) => `<li class="event__offer">
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
export default class PointView {

  point = {};
  element = null;

  constructor(point) {
    this.point = point;
  }

  getTemplate(point) {
    return createPointTemplate(point);
  }


  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate(this.point));
    }
    return this.element;
  }


  removeElement() {
    this.element = null;
  }
}
