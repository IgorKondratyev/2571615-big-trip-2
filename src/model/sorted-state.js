import Observable from '../framework/observable.js';

export default class SortedState extends Observable {
  filteredStateOfPoints = [];
  sortedStateOfPoints = [];

  patchSortedState = (cb, type, payload) => {
    const lastState = this.filteredStateOfPoints.at(-1);
    const newSortedState = cb([...lastState]);
    this.sortedStateOfPoints.push(newSortedState);
    this._notify(type, payload);
  };
}
