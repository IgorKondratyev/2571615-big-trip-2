import AddNewPointPresenter from './add-new-point-presenter.js';
import PointsListPresenter from './points-list-presenter.js';
import FilterPresenter from './filter-presenter.js';
import SortPresenter from './sort-presenter.js';
import LoadingPresenter from './loading-presenter.js';
import AdditionalInfoPresenter from './additional-info-presenter.js';
import FailedLoadDataPresenter from './failed-load-data-presenter.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class BoardPresenter {

  #addNewPointPresenter;
  #filterPresenter;
  #sortPresenter;
  #loadingPresenter;
  #pointsListPresenter;
  #pointPresenters;
  #additionalInfoPresenter;
  #failedLoadDataPresenter = new FailedLoadDataPresenter();

  loadingState = {isLoading: true};

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  currentEditId = {editID: undefined};
  currentEditIdController = (id = undefined) => {
    const currentID = this.currentEditId.editID;
    if(currentID) {
      this.#pointPresenters.at(-1)[currentID].replaceEditFormToPoint();
    }
    this.currentEditId.editID = id;
  };

  #mainState;
  #filteredState;
  #sortedState;

  currentFilterCallback;
  currentFilterMessage;

  currentSortCallback;

  userActionsHandler = async (action, type, payload) => {
    if(this.loadingState.isLoading) {
      return;
    }

    this.#uiBlocker.block();

    switch (action) {
      case UserAction.POINT_PATCH:
        try {
          await this.patchCurrentStateOfPoints(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t update point');
        }
        break;
      case UserAction.FILTER:
        try {
          await this.patchFilteredState(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t update point');
        }
        break;
      case UserAction.SORT:
        try {
          await this.patchSortedState(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t update point');
        }
        break;
      case UserAction.DELETE:
        try {
          await this.deletePoint(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t update point');
        }
        break;
      case UserAction.ADD:
        try {
          await this.addPoint(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t update point');
        }
        break;
    }

  };

  modelEventHandler = (type, payload) => {
    switch (type) {
      case UpdateType.LOAD_ERROR:
        this.#loadingPresenter.destroy();
        this.loadingState.isLoading = false;
        this.#failedLoadDataPresenter.renderComponent();
        return;
      case UpdateType.INIT:
        this.#loadingPresenter.destroy();
        this.loadingState.isLoading = false;
        this.#sortPresenter.init();
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
    this.#additionalInfoPresenter.renderInfoComponent(this.#mainState.defaultSortedState);
    this.#filterPresenter.renderFilters(this.#mainState.currentStateOfPoints.at(-1));
  };

  patchCurrentStateOfPoints = async (type, payload) => {
    try {
      await this.#mainState.patchCurrentStateOfPoints(type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  patchFilteredState = async (type, payload) => {
    try {
      const filterCallback = this.currentFilterCallback.at(-1);
      const filterMsg = this.currentFilterMessage.at(-1);
      await this.#filteredState.patchFilteredState(filterCallback, filterMsg, type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  patchSortedState = async (type, payload) => {
    try {
      const sortCallback = this.currentSortCallback.at(-1);
      await this.#sortedState.patchSortedState(sortCallback, type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  deletePoint = async (type, payload) => {
    try {
      await this.#mainState.deletePoint(type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  addPoint = async (type, payload) => {
    try {
      await this.#mainState.addPoint(type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  constructor(container, model, filterContainer) {

    this.container = container;
    this.model = model;
    this.#mainState = this.model.mainState;
    this.#filteredState = this.model.filteredState;
    this.#sortedState = this.model.sortedState;

    this.#loadingPresenter = new LoadingPresenter();

    this.#additionalInfoPresenter = new AdditionalInfoPresenter(this.#mainState.defaultSortedState);

    this.#pointsListPresenter = new PointsListPresenter(this.container, this.userActionsHandler, this.#filteredState, this.currentEditId, this.currentEditIdController);
    this.#pointPresenters = this.#pointsListPresenter.pointPresenters;

    this.filtersContainer = filterContainer;
    this.#filterPresenter = new FilterPresenter(this.filtersContainer, this.userActionsHandler);
    this.currentFilterCallback = this.#filterPresenter.currentFilterCallback;
    this.currentFilterMessage = this.#filterPresenter.currentFilterMessage;

    this.#addNewPointPresenter = new AddNewPointPresenter(this.currentEditIdController, this.userActionsHandler, this.#filteredState.defaultPatchFilteredState, this.#filterPresenter.updateFilters);

    this.sortContainer = document.querySelector('.trip-events');
    this.#sortPresenter = new SortPresenter(this.sortContainer, this.userActionsHandler);
    this.currentSortCallback = this.#sortPresenter.currentSortCallback;

    const defaultSortingAction = () => {
      this.#mainState.defaultSortedState.push(this.#mainState.currentStateOfPoints.at(-1).toSorted((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)));
    };
    this.#mainState.addObserver(defaultSortingAction);
    this.#mainState.addObserver(this.modelEventHandler);
    this.#mainState.addObserver(this.patchFilteredState);
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
    this.#loadingPresenter.init();
  }

}

