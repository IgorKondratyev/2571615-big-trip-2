import {render} from '../framework/render.js';
import FailedLoadDataView from '../view/failed-load-data-view.js';

export default class FailedLoadDataPresenter {

  #container = document.querySelector('.trip-events');

  #failedLoadDataComponent = null;

  renderComponent = () => {

    this.#failedLoadDataComponent = new FailedLoadDataView();

    render(this.#failedLoadDataComponent, this.#container);
  };

}

