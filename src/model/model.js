import {UpdateType} from '../constants/update-type.js';
import {adaptToClient} from '../utils/adapt-to-client.js';
import MainState from './main-state.js';
import FilteredState from './filtered-state.js';
import SortedState from './sorted-state.js';
export default class Model {

  #pointsApiService = null;

  rawPoints = [];
  rawDestinations = [];
  rawOffers = [];

  resolvedPoints = [];

  emptyPoint;

  destinationsMap;
  offersMap;
  typesOfPoints;

  mainState = null;

  filteredState = null;

  sortedState = null;

  constructor({pointsApiService}) {

    this.#pointsApiService = pointsApiService;

    this.mainState = new MainState(pointsApiService);

    this.filteredState = new FilteredState();

    this.sortedState = new SortedState();
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
    // try {
      const tasks = await this.#pointsApiService.points;
      this.rawPoints = tasks.map(adaptToClient);
      this.rawDestinations = await this.#pointsApiService.destinations;
      this.rawOffers = await this.#pointsApiService.offers;
      this.createDestinationsMap();
      this.createOffersMap();
      this.createResolvedPoints();
      this.mainState.initialStateOfPoints = this.getResolvedPoints();
      this.emptyPoint = {... this.mainState.initialStateOfPoints[0], ...{basePrice:0, destination: {name: ''}, offers: [], pointOffers: [], type: 'flight', }};
      delete this.emptyPoint.id;
      this.mainState.currentStateOfPoints.push([...this.mainState.initialStateOfPoints]);
      this.mainState.defaultSortedState.push([...this.mainState.initialStateOfPoints].toSorted((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)));
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
    //   this.sortedState._notify(UpdateType.LOAD_ERROR);
    // }
  };
}

