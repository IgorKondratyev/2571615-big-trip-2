import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createAddFormTemplate(point) {

  const offersMarkup = point.pointOffers.map((offer) => `
    <div class="event__offer-selector">
      <input ${point.isDisabled ? 'disabled' : ''} class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.title.toLowerCase().replace(/\s+/g, '-')}" ${offer.isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  const pointDestinationPhotos = point.destination?.pictures?.length > 0 ? `<div class="event__photos-container">
                      <div class="event__photos-tape">
                      ${point.destination.pictures.map((picture)=>`<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('')}
                       </div>` : '';

  const pointDestination = point.destination?.description ? `<section class="event__section event__section--destination">
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
                  <input ${point.isDisabled ? 'disabled' : ''} class="event__type-toggle visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">
                  <div class="event__type-list">
                    <fieldset class="event__type-group">
                      <legend class="visually-hidden">Event type</legend>
                      ${types.map((type) => `
                        <div class="event__type-item">
                          <input ${point.isDisabled ? 'disabled' : ''} id="event-type-${type}-${point.id}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''}>
                          <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${point.id}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
                        </div>
                      `).join('')}
                    </fieldset>
                  </div>
                </div>
                <div class="event__field-group event__field-group--destination">
                  <label class="event__label event__type-output" for="event-destination-${point.id}">${point.type}</label>
                  <input ${point.isDisabled ? 'disabled' : ''} class="event__input event__input--destination" id="event-destination-${point.id}" type="text" name="event-destination" value="${point.destination.name}" list="destination-list-${point.id}">
                  ${dataList}
                </div>
                <div class="event__field-group event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-${point.id}">From</label>
                  <input ${point.isDisabled ? 'disabled' : ''} class="event__input event__input--time" id="event-start-time-${point.id}" type="text" name="event-start-time" value="${new Date(point.dateFrom).toLocaleString()}">
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-${point.id}">To</label>
                  <input ${point.isDisabled ? 'disabled' : ''} class="event__input event__input--time" id="event-end-time-${point.id}" type="text" name="event-end-time" value="${new Date(point.dateTo).toLocaleString()}">
                </div>
                <div class="event__field-group event__field-group--price">
                  <label class="event__label" for="event-price-${point.id}">
                    <span class="visually-hidden">Price</span>
                    &euro;
                  </label>
                  <input ${point.isDisabled ? 'disabled' : ''} class="event__input event__input--price" id="event-price-${point.id}" type="text" name="event-price" value="${(+point.basePrice).toFixed(2)}">
                </div>
                <button ${point.isDisabled ? 'disabled' : ''} class="event__save-btn btn btn--blue" type="submit">${point.isSaving ? 'Saving...' : 'Save'}</button>
                <button ${point.isDisabled ? 'disabled' : ''} class="event__reset-btn" type="reset">Cancel</button>
                <button ${point.isDisabled ? 'disabled' : ''} class="event__rollup-btn" type="button">
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

export default class AddNewPointView extends AbstractStatefulView {

  #handleFormSave = null;
  #handleFormExit = null;
  #startDatePicker = null;
  #endDatePicker = null;
  #minDate = undefined;

  removeElement() {
    super.removeElement();
    if (this.#startDatePicker) {
      this.#startDatePicker.destroy();
      this.#startDatePicker = null;
      this.#endDatePicker.destroy();
      this.#endDatePicker = null;
    }
  }

  #setStartDatepicker() {
    this.#startDatePicker = flatpickr(
      this.element.querySelector('.event__input.event__input--time'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#startDateChangeHandler,
      },
    );
  }

  #startDateChangeHandler = ([userDate]) => {
    this.#minDate = userDate;
    this._setState({
      dateFrom: userDate,
    });
  };

  #setEndDatepicker = () => {
    this.#endDatePicker = flatpickr(
      this.element.querySelectorAll('.event__input.event__input--time')[1],
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        minDate: this.#minDate,
        onChange: this.#endDateChangeHandler,
      },
    );
  };

  #endDateChangeHandler = ([userDate]) => {
    this._setState({
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
    this._setState({basePrice: he.encode(inputValue)});
  };

  #offerCheckHandler = (evt) => {
    const id = evt.target.id.replace('event-offer-', '');
    const isChecked = evt.target.checked;
    let offers = structuredClone(this._state.offers);
    const offersState = structuredClone(this._state.pointOffers);
    offersState.find((offer)=>offer.id === id).isChecked = isChecked;
    this._setState({pointOffers: offersState});
    if(isChecked && !offers.includes(id)) {
      offers.push(id);
    }
    if(!isChecked && offers.includes(id)) {
      offers = offers.filter((input) => input.id !== id);
    }
    this._setState({offers});
  };

  _restoreHandlers() {

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formCancelHandler);

    this.element.querySelector('.event__save-btn.btn.btn--blue')
      .addEventListener('click', this.#formSaveHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('click', this.#eventOptionsHandler);

    this.element.querySelectorAll('.event__section.event__section--offers input')
      .forEach((inputElement) => {
        inputElement.addEventListener('change', this.#offerCheckHandler);
      });

    const inputDestination = this.element.querySelector('.event__input.event__input--destination');
    inputDestination.addEventListener('focus', this.#destinationsClickOptionsHandler);
    inputDestination.addEventListener('change', this.#destinationsOptionsHandler);

    this.element.querySelector('.event__input.event__input--price')
      .addEventListener('change', this.#eventPriceHandler);

    this.#setStartDatepicker();
    this.#setEndDatepicker();

  }

  constructor({point, onFormSave, onFormCancel}) {
    super();
    this._setState({...structuredClone(point), ...{isDisabled: false, isSaving: false}});
    this._setState({id: Math.random()});
    this.#handleFormSave = onFormSave;
    this.#handleFormExit = onFormCancel;
    this._restoreHandlers();
  }

  get template() {
    return createAddFormTemplate(this._state);
  }

  #formCancelHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormExit();
  };

  resetFormState = () => {
    this.updateElement({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
  };

  #formSaveHandler = async (evt) => {

    evt.preventDefault();

    this.updateElement({isDisabled: true, isSaving: true});

    try {
      await this.#handleFormSave(this._state);
    } catch {
      this.shake(this.resetFormState);
    }
  };

}


