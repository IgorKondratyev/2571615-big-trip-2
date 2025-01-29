import BoardPresenter from '../src/presenter/board-presenter';
import Model from './model/model';
import TasksApiService from './tasks-api-service.js';
import {AUTHORIZATION} from './constants/server';
import {END_POINT} from './constants/server';


const mainContainer = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');
const model = new Model({
  tasksApiService: new TasksApiService(END_POINT, AUTHORIZATION)
});
model.init();

new BoardPresenter(mainContainer, model, filtersContainer).init();
