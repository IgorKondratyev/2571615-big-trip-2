import AddNewPointPresenter from './add-new-point-presenter.js';
import PointsListPresenter from './points-list-presenter.js';
import FilterPresenter from './filter-presenter.js';
import SortPresenter from './sort-presenter.js';
import LoadingPresenter from './loading-presenter.js';
import AdditionalInfoPresenter from './additional-info-presenter.js';
import FailedLoadDataPresenter from './failed-load-data-presenter.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';
import {Sort} from '../constants/sort-options';
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

  currentFilterCallbacks;
  currentFilterMessages;

  currentSortCallbacks = [];

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
          this.patchFilteredState(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t filter points');
        }
        break;
      case UserAction.SORT:
        try {
          this.patchSortedState(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t sort points');
        }
        break;
      case UserAction.DELETE:
        try {
          await this.deletePoint(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t delete point');
        }
        break;
      case UserAction.ADD:
        try {
          await this.addPoint(type, payload);
          this.#uiBlocker.unblock();
        } catch(err) {
          this.#uiBlocker.unblock();
          throw new Error('Can\'t add point');
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
        this.#filterPresenter.renderFilters(this.#mainState.currentStateOfPoints.at(-1));
        return;
      case UpdateType.INIT:
        this.#loadingPresenter.destroy();
        this.loadingState.isLoading = false;
        this.#sortPresenter.init();
        this.#pointsListPresenter.init(this.#mainState.defaultSortedPoints.at(-1));
        this.#addNewPointPresenter.init(this.model.emptyPoint);
        this.#filterPresenter.renderFilters(this.#mainState.currentStateOfPoints.at(-1));
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
        this.#filterPresenter.renderFilters(this.#mainState.currentStateOfPoints.at(-1));
        this.#pointsListPresenter.renderPointsList(this.#sortedState.sortedStateOfPoints.at(-1));
    }

  };

  patchCurrentStateOfPoints = async (type, payload) => {
    try {
      await this.#mainState.patchCurrentStateOfPoints(type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  patchFilteredState = (type, payload) => {
    const filterCallback = this.currentFilterCallbacks.at(-1);
    const filterMsg = this.currentFilterMessages.at(-1);
    this.#filteredState.patchFilteredState(filterCallback, filterMsg, type, payload);
  };

  patchSortedState = (type, payload) => {
    const sortCallback = this.currentSortCallbacks.at(-1);
    this.#sortedState.patchSortedState(sortCallback, type, payload);
  };

  deletePoint = async (type, payload) => {
    try {
      await this.#mainState.deletePoint(type, payload);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  };

  addPoint = async (type, payload) => {
    try {
      await this.#mainState.addPoint(type, payload);
    } catch(err) {
      throw new Error('Can\'t add point');
    }
  };

  constructor(container, model, filterContainer) {

    this.container = container;
    this.model = model;
    this.#mainState = this.model.mainState;
    this.#filteredState = this.model.filteredState;
    this.#sortedState = this.model.sortedState;

    this.#loadingPresenter = new LoadingPresenter();

    this.#additionalInfoPresenter = new AdditionalInfoPresenter(this.#mainState.defaultSortedPoints);

    this.#pointsListPresenter = new PointsListPresenter(this.container, this.userActionsHandler, this.#filteredState, this.currentEditId, this.currentEditIdController);
    this.#pointPresenters = this.#pointsListPresenter.pointPresenters;

    this.filtersContainer = filterContainer;
    this.#filterPresenter = new FilterPresenter(this.filtersContainer, this.userActionsHandler);
    this.currentFilterCallbacks = this.#filterPresenter.currentFilterCallbacks;
    this.currentFilterMessages = this.#filterPresenter.currentFilterMessages;

    this.#addNewPointPresenter = new AddNewPointPresenter(this.currentEditIdController, this.userActionsHandler, this.#filteredState.getDefaultFilteredState, this.#filterPresenter.updateFilters);

    this.sortContainer = document.querySelector('.trip-events');
    this.#sortPresenter = new SortPresenter(this.sortContainer, this.userActionsHandler);
    this.currentSortCallbacks = this.#sortPresenter.currentSortCallbacks;

    const modifyAdditionalInfoItem = () => {
      this.#mainState.defaultSortedPoints.push(this.#mainState.currentStateOfPoints.at(-1).toSorted((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)));
      this.#additionalInfoPresenter.renderInfoComponent(this.#mainState.defaultSortedPoints);
    };
    this.#mainState.addObserver(modifyAdditionalInfoItem);
    this.#mainState.addObserver(this.patchFilteredState);
    const sortAction = (type, payload) => {
      if(type !== UpdateType.PATCH || this.currentSortCallbacks.length === 0) {
        this.#sortPresenter.sortActions[Sort.DAY]();
      }
      type = UpdateType.MAJOR;
      this.patchSortedState(type, payload);

    };
    this.#filteredState.addObserver(sortAction);
    this.#sortedState.addObserver(this.modelEventHandler);

  }

  init() {
    this.#filterPresenter.init();
    this.#loadingPresenter.init();
  }

}

