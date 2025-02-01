import Observable from '../framework/observable.js';

export default class FilteredState extends Observable {
  currentStateOfPoints = [];
  filteredStateOfPoints = [];
  currentFilterMessage = '';
  patchFilteredState = (cb, filterMessage, type, payload) => {
    const newFilteredState = cb([...this.currentStateOfPoints.at(-1)]);
    this.filteredStateOfPoints.push(newFilteredState);
    this.currentFilterMessage = filterMessage;
    this._notify(type, payload);
  };

  defaultPatchFilteredState = () => {
    const cb = (state) => state;
    const filterMessage = 'Click New Event to create your first point';
    const type = 'MAJOR';
    const payload = null;
    const newFilteredState = cb([...this.currentStateOfPoints.at(-1)]);
    this.filteredStateOfPoints.push(newFilteredState);
    this.currentFilterMessage = filterMessage;
    this._notify(type, payload);
  };

}
