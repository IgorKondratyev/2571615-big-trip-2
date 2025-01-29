import AbstractView from '../framework/view/abstract-view.js';


function createAdditionalInfoTemplate(sortedState) {

  const formatDestinationNames = (destinations) => destinations.map((point, index) => index === 0 ? `${point.destination.name}` : `— ${point.destination.name}`).join(' ');

  let destinationsList;

  if (sortedState.at(-1).length === 0) {
    destinationsList = '';
  } else if (sortedState.at(-1).length === 1) {
    destinationsList = sortedState.at(-1)[0].destination.name;
  } else if (sortedState.at(-1).length <= 3) {
    destinationsList = formatDestinationNames(sortedState.at(-1));
  } else {
    const firstDestination = sortedState.at(-1)[0].destination.name;
    const lastDestination = sortedState.at(-1)[sortedState.at(-1).length - 1].destination.name;
    destinationsList = `${firstDestination} —...— ${lastDestination}`;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  let dataList;

  if (sortedState.at(-1).length === 0) {
    dataList = '';
  } else if (sortedState.at(-1).length === 1) {
    dataList = formatDate(sortedState.at(-1)[0].dateFrom);
  } else {
    dataList = `${formatDate(sortedState.at(-1)[0].dateFrom)} — ${formatDate(sortedState.at(-1)[sortedState.at(-1).length - 1].dateFrom)}`;
  }

  const getTotalCost = () => {
    const result = sortedState.at(-1).reduce((acc, point) => acc + +point.basePrice, 0);
    return result;
  };

  const totalCost = getTotalCost();

  return `  <section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${destinationsList}</h1>

              <p class="trip-info__dates">${dataList}</p>
            </div>

            <p class="trip-info__cost">
              Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
            </p>
          </section>`;
}

export default class AdditionalInfoView extends AbstractView {

  #state = null;

  get template() {
    return createAdditionalInfoTemplate(this.#state);
  }

  constructor(sortedState) {
    super();
    this.#state = sortedState;
  }
}


