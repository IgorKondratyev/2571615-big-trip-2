import PointsListView from '../view/points-list-view';
import PointPresenter from './point-presenter.js';
import EmptyPointsListView from '../view/empty-view.js';
import {render, replace, remove} from '../framework/render.js';

export default class PointsListPresenter {

  #container = null;
  #pointsListComponent = null;
  #prevListComponent = null;
  #emptyListComponent = null;
  #emptyPointsListContainer = document.querySelector('.trip-events');
  #points;
  #userActionsHandler;
  #currentEditId;
  #currentEditIdController;
  #filteredState = null;

  pointPresenters = [];

  init(points) {
    this.#points = points;
    this.renderPointsList(this.#points);
  }

  destroy(component){
    if(component) {
      remove(component);
    }
  }

  renderPointsList = (points) => {

    if (!points || points.length === 0) {
      this.destroy(this.#pointsListComponent);
      this.#prevListComponent = null;
      this.destroy(this.#emptyListComponent);
      this.#emptyListComponent = new EmptyPointsListView(this.#filteredState.currentFilterMessage);
      render(this.#emptyListComponent, this.#emptyPointsListContainer);
      return;
    }

    this.destroy(this.#emptyListComponent);
    this.#emptyListComponent = null;

    this.#pointsListComponent = new PointsListView();

    const modifiedPointPresenters = {};
    points.forEach((point) => {
      modifiedPointPresenters[point.id] = new PointPresenter(this.#pointsListComponent, this.#currentEditId, this.#currentEditIdController, this.#userActionsHandler);
      modifiedPointPresenters[point.id].renderPoint(point);
    });
    this.pointPresenters.push(modifiedPointPresenters);


    if(this.#prevListComponent === null) {
      render(this.#pointsListComponent, this.#container);
    } else {
      replace(this.#pointsListComponent, this.#prevListComponent);
    }
    this.#prevListComponent = this.#pointsListComponent;
  };


  constructor (container, userActionsHandler, filteredState, currentEditId, currentEditIdController) {
    this.#container = container;
    this.#userActionsHandler = userActionsHandler;
    this.#filteredState = filteredState;
    this.#currentEditId = currentEditId;
    this.#currentEditIdController = currentEditIdController;
  }

}
