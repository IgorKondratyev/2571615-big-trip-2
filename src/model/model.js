import {destinationsMock} from '../mocks/destinations-mock';
import {offersMock} from '../mocks/offers-mock';
import {pointsMock} from '../mocks/points-mock';
import Observable from '../framework/observable.js';

class MainState extends Observable {
  initialStateOfPoints = null;
  currentStateOfPoints = [];
  patchCurrentStateOfPoints = (type, payload) => {
    const newCurrentStateOfPoints = this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? payload : item);
    this.currentStateOfPoints.push(newCurrentStateOfPoints);
    this._notify(type, payload);
  };

  deletePoint = (type, payload) => {
    const newCurrentStateOfPoints = (this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? null : item)).filter(Boolean);
    this.currentStateOfPoints.push(newCurrentStateOfPoints);
    this._notify(type, payload);
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

  rawPoints = pointsMock;
  rawDestinations = destinationsMock;
  rawOffers = offersMock;

  resolvedPoints = [];

  emptyPoint;

  destinationsMap;
  offersMap;
  typesOfPoints;

  mainState = new MainState;

  filteredState = new FilteredState;

  sortedState = new SortedState;

  constructor() {
    this.createDestinationsMap();
    this.createOffersMap();
    this.createResolvedPoints();
    this.emptyPoint = {...this.getResolvedPoints()[0], ...{basePrice:0, dateFrom: '', dateTo:'', destination: {}, offers: [], pointOffers: [], type: 'flight', }};
    this.mainState.initialStateOfPoints = this.getResolvedPoints();
    this.mainState.currentStateOfPoints.push([...this.mainState.initialStateOfPoints]);
    this.filteredState.currentStateOfPoints = this.mainState.currentStateOfPoints;
    this.filteredState.filteredStateOfPoints.push(this.mainState.initialStateOfPoints);
    this.sortedState.filteredStateOfPoints = this.filteredState.filteredStateOfPoints;
    this.sortedState.sortedStateOfPoints.push(this.sortedState.filteredStateOfPoints[0]);
    this.typesOfPoints = Object.keys(this.offersMap);
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

  init() {
    if (this.resolvedPoints.length > 0) {
      //ToDo;
    }
  }
}

