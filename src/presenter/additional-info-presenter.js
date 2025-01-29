import {render, remove, RenderPosition} from '../framework/render.js';
import AdditionalInfoView from '../view/additional-info-view.js';


export default class AdditionalInfoPresenter {

  #container = document.querySelector('.trip-main');

  #state = null;

  #infoComponent = null;

  constructor (sortedState) {
    this.#state = sortedState;
  }

  renderInfoComponent = (sortedState) => {

    if(this.#infoComponent) {
      remove(this.#infoComponent);
    }

    this.#infoComponent = new AdditionalInfoView(sortedState);

    render(this.#infoComponent, this.#container, RenderPosition.AFTERBEGIN);
  };


}

