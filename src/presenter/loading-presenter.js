import LoadingView from '../view/loading-view.js';
//import PointView from '../view/point-view';
import {render, remove} from '../framework/render.js';
// import {UserAction} from '../constants/user-action.js';
// import {UpdateType} from '../constants/update-type.js';


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
