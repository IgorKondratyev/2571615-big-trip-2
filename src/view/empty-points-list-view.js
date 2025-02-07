import AbstractView from '../framework/view/abstract-view.js';

function createEmptyPointsListTemplate(message) {
  return `<p class="trip-events__msg">${message}</p>`;
}

export default class EmptyPointsListView extends AbstractView {

  #message = '';

  get template() {
    return createEmptyPointsListTemplate(this.#message);
  }

  constructor (message) {
    super();
    this.#message = message;
  }
}
