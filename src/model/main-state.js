import Observable from '../framework/observable.js';
import {adaptToClient} from '../utils/adapt-to-client.js';

export default class MainState extends Observable {
  initialStateOfPoints = null;
  currentStateOfPoints = [];
  defaultSortedState = [];
  #pointsApiService = null;

  constructor(pointsApiService) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  patchCurrentStateOfPoints = async (type, payload) => {
    try {
      await this.#pointsApiService.updatePoint(payload);
      const newCurrentStateOfPoints = this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? payload : item);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, payload);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  deletePoint = async (type, payload) => {
    try {
      await this.#pointsApiService.deletePoint(payload);
      const newCurrentStateOfPoints = (this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? null : item)).filter(Boolean);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, payload);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  };

  addPoint = async (type, payload) => {
    try {
      const response = await this.#pointsApiService.addPoint(payload);
      const newTask = {...adaptToClient(response), ...payload};
      const newCurrentStateOfPoints = [...this.currentStateOfPoints.at(-1)];
      newCurrentStateOfPoints.unshift(newTask);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, newTask);
    } catch(err) {
      throw new Error('Can\'t add point');
    }
  };
}
