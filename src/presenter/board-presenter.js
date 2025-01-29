import addNewPointPresenter from './add-new-point-presenter.js';
import PointsListPresenter from './points-list-presenter.js';
import FilterPresenter from './filter-presenter.js';
import SortPresenter from './sort-presenter.js';
import LoadingPresenter from './loading-presenter.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';

export default class BoardPresenter {

  #addNewPointPresenter;
  #filterPresenter;
  #sortPresenter;
  #loadingPresenter;
  #pointsListPresenter;
  #pointPresenters;

  loadingState = {isLoading: true}; // прокинуть в фильтры и сортировку чтобы во время загрузки ничего не нажималось

  currentEditId = {editID: undefined};
  currentEditIdController = (id = undefined) => {
    const currentID = this.currentEditId.editID;
    if(currentID) {
      this.#pointPresenters.at(-1)[currentID].replaceEditFormToPoint(); //закрываем текущую форму ред.
    }
    this.currentEditId.editID = id;
  };

  #mainState;
  #filteredState;
  #sortedState;

  currentFilterCallback;
  currentFilterMessage;

  currentSortCallback;

  userActionsHandler = (action, type, payload) => {
    if(this.loadingState.isLoading) {
      return;
    }
    switch (action) {
      case UserAction.POINT_PATCH:
        this.patchCurrentStateOfPoints(type, payload);
        break;
      case UserAction.FILTER:
        this.patchFilteredState(type, payload);
        break;
      case UserAction.SORT:
        this.patchSortedState(type, payload);
        break;
      case UserAction.DELETE:
        this.deletePoint(type, payload);
        break;
      case UserAction.ADD:
        this.addPoint(type, payload);
        break;
    }
  };

  modelEventHandler = (type, payload) => {
    switch (type) {
      case UpdateType.INIT:
        this.#loadingPresenter.destroy();
        this.loadingState.isLoading = false;
        this.#pointsListPresenter.init(this.#mainState.initialStateOfPoints);
        this.#addNewPointPresenter.init(this.model.emptyPoint);
        break;
      case UpdateType.PATCH:
        this.#pointPresenters.at(-1)[payload.id].renderPoint(payload);
        break;
      case UpdateType.MINOR:
        this.#sortPresenter.renderSort();
        this.#pointsListPresenter.renderPointsList(this.#sortedState.sortedStateOfPoints.at(-1));
        break;
      case UpdateType.MAJOR:
        this.#sortPresenter.renderSort();
        this.#filterPresenter.renderFilters();
        this.#pointsListPresenter.renderPointsList(this.#sortedState.sortedStateOfPoints.at(-1));
    }
  };


  patchCurrentStateOfPoints = (type, payload) => {
    this.#mainState.patchCurrentStateOfPoints(type, payload);
  };

  patchFilteredState = (type, payload) => {
    const filterCallback = this.currentFilterCallback.at(-1);
    const filterMsg = this.currentFilterMessage.at(-1);
    this.#filteredState.patchFilteredState(filterCallback, filterMsg, type, payload);
  };

  patchSortedState = (type, payload) => {
    const sortCallback = this.currentSortCallback.at(-1);
    this.#sortedState.patchSortedState(sortCallback, type, payload);
  };

  deletePoint = (type, payload) => {
    this.#mainState.deletePoint(type, payload);
  };

  addPoint = (type, payload) => {
    this.#mainState.addPoint(type, payload);
  };

  constructor(container, model, filterContainer) {

    this.container = container;
    this.model = model;
    this.#mainState = this.model.mainState;
    this.#filteredState = this.model.filteredState;
    this.#sortedState = this.model.sortedState;

    this.#loadingPresenter = new LoadingPresenter();

    this.#pointsListPresenter = new PointsListPresenter(this.container, this.userActionsHandler, this.#filteredState, this.currentEditId, this.currentEditIdController);
    this.#pointPresenters = this.#pointsListPresenter.pointPresenters;

    this.#addNewPointPresenter = new addNewPointPresenter(this.currentEditIdController, this.userActionsHandler);

    this.filtersContainer = filterContainer;
    this.#filterPresenter = new FilterPresenter(this.filtersContainer, this.userActionsHandler);
    this.currentFilterCallback = this.#filterPresenter.currentFilterCallback;
    this.currentFilterMessage = this.#filterPresenter.currentFilterMessage;

    this.sortContainer = document.querySelector('.trip-events');
    this.#sortPresenter = new SortPresenter(this.sortContainer, this.userActionsHandler);
    this.currentSortCallback = this.#sortPresenter.currentSortCallback;

    this.#mainState.addObserver(this.modelEventHandler); // несколько раз подписываем хенлер рендеринга
    this.#mainState.addObserver(this.patchFilteredState); // можно оставить только на сортировку
    this.#filteredState.addObserver(this.modelEventHandler);
    const defaultSortAction = (type, payload) => {
      this.#sortPresenter.sortActions['sort-day']();
      this.patchSortedState(type, payload);
    };
    this.#filteredState.addObserver(defaultSortAction);
    this.#sortedState.addObserver(this.modelEventHandler);

  }

  init() {
    this.#filterPresenter.init();
    this.#sortPresenter.init();
    this.#loadingPresenter.init();
    // this.#pointsListPresenter.init(this.#mainState.initialStateOfPoints);
    // this.#addNewPointPresenter.init(this.model.emptyPoint);
  }

}

