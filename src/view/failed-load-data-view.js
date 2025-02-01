import AbstractView from '../framework/view/abstract-view.js';

function createFailedLoadDataTemplate() {
  return '<p class="trip-events__msg">Failed to load latest route information</p>';
}
export default class FailedLoadDataView extends AbstractView {

  get template() {
    return createFailedLoadDataTemplate();
  }

}
