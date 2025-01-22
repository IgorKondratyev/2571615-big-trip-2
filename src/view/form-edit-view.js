import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createFormEditTemplate(point) {

  const offersMarkup = point.pointOffers.map((offer) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.title.toLowerCase().replace(/\s+/g, '-')}" ${offer.isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  const pointDestinationPhotos = point.destination.pictures.length > 0 ? `<div class="event__photos-container">
                      <div class="event__photos-tape">
                      ${point.destination.pictures.map((picture)=>`<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                       </div>` : '';

  const pointDestination = point.destination.description ? `<section class="event__section event__section--destination">
                  <h3 class="event__section-title event__section-title--destination">Destination</h3>
                  <p class="event__destination-description">${point.destination.description}</p>
                  ${pointDestinationPhotos}
                  </section>` : '';

  const destinations = Object.values(point.destinationsMap).map((item)=>item.name);
  const types = Object.keys(point.offersMap);

  const dataList = `<datalist id="destination-list-${point.id}">
               ${destinations.map((destination)=>`<option value="${destination}" label="${destination}"></option>`).join('')}

                  </datalist>`;

  return `<li class="trip-events__item">
            <form class="event event--edit" action="#" method="post">
              <header class="event__header">
                <div class="event__type-wrapper">
                  <label class="event__type event__type-btn" for="event-type-toggle-${point.id}">
                    <span class="visually-hidden">Choose event type</span>
                    <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">
                  <div class="event__type-list">
                    <fieldset class="event__type-group">
                      <legend class="visually-hidden">Event type</legend>
                      ${types.map((type) => `
                        <div class="event__type-item">
                          <input id="event-type-${type}-${point.id}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''}>
                          <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${point.id}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
                        </div>
                      `).join('')}
                    </fieldset>
                  </div>
                </div>
                <div class="event__field-group event__field-group--destination">
                  <label class="event__label event__type-output" for="event-destination-${point.id}">${point.type}</label>
                  <input class="event__input event__input--destination" id="event-destination-${point.id}" type="text" name="event-destination" value="${point.destination.name}" list="destination-list-${point.id}">
                  ${dataList}
                </div>
                <div class="event__field-group event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-${point.id}">From</label>
                  <input class="event__input event__input--time" id="event-start-time-${point.id}" type="text" name="event-start-time" value="${new Date(point.dateFrom).toLocaleString()}">
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-${point.id}">To</label>
                  <input class="event__input event__input--time" id="event-end-time-${point.id}" type="text" name="event-end-time" value="${new Date(point.dateTo).toLocaleString()}">
                </div>
                <div class="event__field-group event__field-group--price">
                  <label class="event__label" for="event-price-${point.id}">
                    <span class="visually-hidden">Price</span>
                    &euro;
                  </label>
                  <input class="event__input event__input--price" id="event-price-${point.id}" type="text" name="event-price" value="${(point.basePrice / 100).toFixed(2)}">
                </div>
                <button class="event__save-btn btn btn--blue" type="submit">Save</button>
                <button class="event__reset-btn" type="reset">Delete</button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </header>
              <section class="event__details">
                <section class="event__section event__section--offers">
                  <h3 class="event__section-title event__section-title--offers">Offers</h3>
                  <div class="event__available-offers">
                    ${offersMarkup}
                  </div>
                </section>
                ${pointDestination}
            </form>
          </li>`;
}

export default class FormEditView extends AbstractStatefulView {

  #handleFormSubmit = null;
  #handleFormExit = null;
  #handleFormDelete = null;
  #startdatepicker = null;
  #enddatepicker = null;
  #initialState = null;
  #minDate = undefined;

  removeElement() {
    super.removeElement();
    if (this.#startdatepicker) {
      this.#startdatepicker.destroy();
      this.#startdatepicker = null;
      this.#enddatepicker.destroy();
      this.#enddatepicker = null;

    }
  }

  #setStartDatepicker() {
    this.#startdatepicker = flatpickr(
      this.element.querySelector('.event__input.event__input--time'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        //time_24hr: true,
        defaultDate: this._state.dateFrom,
        onChange: this.#startDateChangeHandler,
      },
    );
  }

  #startDateChangeHandler = ([userDate]) => {
    this.#minDate = userDate;
    this.updateElement({
      dateFrom: userDate,
    });
  };

  #setEndDatepicker = () => {
    this.#enddatepicker = flatpickr(
      this.element.querySelectorAll('.event__input.event__input--time')[1],
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        //time_24hr: true,
        defaultDate: this._state.dateTo,
        minDate: this.#minDate,
        onChange: this.#endDateChangeHandler,
      },
    );
  };

  #endDateChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
  };

  #eventOptionsHandler = (evt)=> {
    const typeItem = evt.target.closest('.event__type-item');
    if(typeItem) {
      evt.stopPropagation();
      const input = typeItem.querySelector('input');
      const inputType = input.value;
      this.updateElement({type: inputType, pointOffers: Object.values(this._state.offersMap[inputType])});
    }
  };

  #destinationsClickOptionsHandler = (evt)=> {
    const input = evt.target;
    input.value = '';
  };

  #destinationsOptionsHandler = (evt)=> {
    const input = evt.target;
    const newDestination = input.value;
    this.updateElement({destination: Object.values(this._state.destinationsMap).find((destination)=>destination.name === newDestination)});
  };

  #eventPriceHandler = (evt) => {
    const input = evt.target;
    const inputValue = input.value;
    this.updateElement({basePrice: inputValue * 100});
  };

  _restoreHandlers() {

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#formExitHandler);

    this.element.querySelector('.event__save-btn.btn.btn--blue')
      .addEventListener('click', this.#formSubmitHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this. #formDeleteHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('click', this.#eventOptionsHandler);

    const inputDestination = this.element.querySelector('.event__input.event__input--destination');
    inputDestination.addEventListener('focus', this.#destinationsClickOptionsHandler);
    inputDestination.addEventListener('change', this.#destinationsOptionsHandler);

    this.element.querySelector('.event__input.event__input--price')
      .addEventListener('change', this.#eventPriceHandler);

    this.#setStartDatepicker();
    this.#setEndDatepicker();

  }

  constructor({point, onFormSubmit, onExit, onDelete}) {
    super();
    this.#initialState = point;
    this._setState(structuredClone(point));
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormExit = onExit;
    this.#handleFormDelete = onDelete;
    this._restoreHandlers();
  }

  get template() {
    return createFormEditTemplate(this._state);
  }

  exitWithReset = () => {
    this.updateElement(this.#initialState);
    this.#handleFormExit();
  };

  #formExitHandler = (evt) => {
    evt.preventDefault();
    this.exitWithReset();
  };

  #formDeleteHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormDelete(this._state);
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const { type, offersMap } = this._state;
    const offers = Object.values(offersMap[type]);

    const offerElements = this.element.querySelectorAll('.event__section.event__section--offers input');

    offerElements.forEach((input) => {
      const offerById = offers.find((offer) => input.id.includes(offer.id));
      if (offerById) {
        offerById.isChecked = input.checked;
      }
    });

    this._setState({ pointOffers: offers });
    this.#handleFormSubmit(this._state);
  };
}


