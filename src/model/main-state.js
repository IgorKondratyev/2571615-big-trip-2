import Observable from '../framework/observable.js';

export default class MainState extends Observable {
  initialStateOfPoints = null;
  currentStateOfPoints = [];
  defaultSortedState = [];
  #tasksApiService = null;

  constructor(tasksApiService) {
    super();
    this.#tasksApiService = tasksApiService;
  }

  patchCurrentStateOfPoints = async (type, payload) => {
    try {
      await this.#tasksApiService.updatePoint(payload);
      const newCurrentStateOfPoints = this.currentStateOfPoints.at(-1).map((item)=> item.id === payload.id ? payload : item);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, payload);
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
      const newTask = {...adaptToClient(response), ...payload}; //console.log(newTask)
      const newCurrentStateOfPoints = [...this.currentStateOfPoints.at(-1)];
      newCurrentStateOfPoints.unshift(newTask);
      this.currentStateOfPoints.push(newCurrentStateOfPoints);
      this._notify(type, newTask);
    } catch(err) {
      throw new Error('Can\'t add task');
    }
  };
}
