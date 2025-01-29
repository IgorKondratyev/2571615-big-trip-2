import LoadingView from '../view/loading-view.js';
import {render, remove} from '../framework/render.js';

export default class LoadingPresenter {

  #container = document.querySelector('.trip-events');
  #loadingComponent = new LoadingView();

  renderItem = () => {
    render(this.#loadingComponent, this.#container);
  };

  init = () => {
    this.renderItem();
  };

  destroy = () => {
    remove(this.#loadingComponent);
  };

}
