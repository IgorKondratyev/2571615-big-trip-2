import Observable from '../framework/observable.js';
import {UpdateType} from '../constants/update-type.js';
import {adaptToClient} from '../utils/adapt-to-client.js';
import TasksApiService from '../tasks-api-service.js';

class MainState extends Observable {
  initialStateOfPoints = null;
  currentStateOfPoints = [];
  #tasksApiService = new TasksApiService();

  patchCurrentStateOfPoints = async (type, payload) => {
    try {
      const response = await this.#tasksApiService.updatePoint(payload);
      const updatedTask = adaptToClient(response);
      const newCurrentStateOfPoints = this.currentStateOfPoints.at(-1).map((item)=> item.id === updatedTask.id ? updatedTask : item);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, updatedTask);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  deletePoint = async (type, payload) => {
    try {
      await this.#tasksApiService.deleteTask(payload);
      const newCurrentStateOfPoints = (this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? null : item)).filter(Boolean);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, payload);
    } catch(err) {
      throw new Error('Can\'t delete task');
    }
  };

  addPoint = async (type, payload) => {

    try {
      const response = await this.#tasksApiService.addTask(payload);
      const newTask = adaptToClient(response); console.log(newTask)
      const newCurrentStateOfPoints = [...this.currentStateOfPoints.at(-1)];
      newCurrentStateOfPoints.unshift(newTask);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, newTask);
    } catch(err) {
      throw new Error('Can\'t add task');
    }
  };
}
class FilteredState extends Observable {
  currentStateOfPoints = [];
  filteredStateOfPoints = [];
  currentFilterMessage = '';
  patchFilteredState = (cb, filterMessage, type, payload) => {
    const newFilteredState = cb([...this.currentStateOfPoints.at(-1)]);
    this.filteredStateOfPoints.push(newFilteredState);
    this.currentFilterMessage = filterMessage;
    this._notify(type, payload);
  };
}
class SortedState extends Observable {
  filteredStateOfPoints = [];
  sortedStateOfPoints = [];

  patchSortedState = (cb, type, payload) => {
    const lastState = this.filteredStateOfPoints.at(-1);
    //if(lastState.length > 0) {
    const newSortedState = cb([...lastState]);
    this.sortedStateOfPoints.push(newSortedState);
    this._notify(type, payload);
    // }
  };
}

export default class Model {

  #tasksApiService = null;

  rawPoints = [];
  rawDestinations = [];
  rawOffers = [];

  resolvedPoints = [];

  emptyPoint;

  destinationsMap;
  offersMap;
  typesOfPoints;

  mainState = new MainState;

  filteredState = new FilteredState;

  sortedState = new SortedState;

  constructor({tasksApiService}) {
    this.#tasksApiService = tasksApiService;
  }

  createDestinationsMap() {
    this.destinationsMap = this.rawDestinations.reduce((acc, destination) => {
      acc[destination.id] = destination;
      return acc;
    }, {});
  }

  createOffersMap() {
    this.offersMap = this.rawOffers.reduce((acc, offer) => {
      acc[offer.type] = offer.offers.reduce((offerAcc, item) => {
        offerAcc[item.id] = item;
        return offerAcc;
      }, {});
      return acc;
    }, {});
  }

  createResolvedPoints() {
    this.resolvedPoints = this.rawPoints.map((point) => {
      const destination = {...this.destinationsMap[point.destination]};
      const checkedOffers = point.offers.map((offerId) => {
        if (this.offersMap[point.type]) {
          return this.offersMap[point.type][offerId];
        }
        return null;
      }).filter(Boolean);

      const utilOffersMap = new Map();

      const pointOffers = [];

      Object.values(this.offersMap[point.type]).forEach((offer)=>{
        utilOffersMap.set(offer, structuredClone(offer));
      });

      utilOffersMap.forEach((clonedOffer, offer) => {
        clonedOffer['isChecked'] = checkedOffers.includes(offer);
        pointOffers.push(clonedOffer);
      });

      const destinationsMap = structuredClone(this.destinationsMap);
      const offersMap = structuredClone(this.offersMap);
      const typesOfPoints = structuredClone(this.typesOfPoints);

      return {
        ...point,
        destination,
        pointOffers,
        destinationsMap,
        offersMap,
        typesOfPoints
      };
    });
  }

  getResolvedPoints() {
    return this.resolvedPoints;
  }

  init = async () => {
    //try {
    const tasks = await this.#tasksApiService.points;
    this.rawPoints = tasks.map(adaptToClient);
    this.rawDestinations = await this.#tasksApiService.destinations;
    this.rawOffers = await this.#tasksApiService.offers;
    this.createDestinationsMap();
    this.createOffersMap();
    this.createResolvedPoints();
    this.mainState.initialStateOfPoints = this.getResolvedPoints();
    this.emptyPoint = {... this.mainState.initialStateOfPoints[0], ...{basePrice:0, dateTo: null, dateFrom: null, destination: {name: ''}, offers: [], pointOffers: [], type: 'flight', }};
    delete this.emptyPoint.id;
    this.mainState.currentStateOfPoints.push([...this.mainState.initialStateOfPoints]);
    this.filteredState.currentStateOfPoints = this.mainState.currentStateOfPoints;
    this.filteredState.filteredStateOfPoints.push(this.mainState.initialStateOfPoints);
    this.sortedState.filteredStateOfPoints = this.filteredState.filteredStateOfPoints;
    this.sortedState.sortedStateOfPoints.push(this.sortedState.filteredStateOfPoints[0]);
    this.sortedState._notify(UpdateType.INIT);
    this.typesOfPoints = Object.keys(this.offersMap);
    // } catch(err) {
    //   this.rawPoints = [];
    //   this.rawDestinations = [];
    //   this.rawOffers = [];
    // }
  };
}

