import {render, remove, RenderPosition} from '../framework/render.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';
import AddNewPointView from '../view/add-new-point.js';


export default class addNewPointPresenter {

  #baseContainer = null;
  #generatedContainer = null;
  #point = null;
  #formComponent = null;
  #currentEditIdController = null;
  // #currentEditId = {editID: undefined};
  #userActionsHandler = null;
  #addButton = document.querySelector('.trip-main__event-add-btn.btn.btn--big.btn--yellow');


  addButtonInit = () => {
    this.#addButton.addEventListener('click', this.renderForm);
  };

  handleEscKeyDown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.closeForm();
      document.removeEventListener('keydown', this.handleEscKeyDown);
    }
  };

  closeForm = () => {
    remove(this.#formComponent);
    if(this.#generatedContainer !== null) {
      this.#generatedContainer.remove();
      this.#generatedContainer = null;
    }
    this.#addButton.disabled = false;
  };

  generateContainer = () => {
    if(this.#generatedContainer === null) {
      const ulElement = document.createElement('ul');
      ulElement.setAttribute('class', 'trip-events__list');
      const sectionElement = document.querySelector('section.trip-events');
      sectionElement.appendChild(ulElement);
      this.#generatedContainer = ulElement;
      return ulElement;
    }
  };


  init(point) {
    this.#point = structuredClone(point);
    this.addButtonInit();
  }

  renderForm = () => {

    this.#formComponent = new AddNewPointView({
      point: this.#point,
      onFormSave: (state) => {
        this.#userActionsHandler(UserAction.ADD, UpdateType.MINOR, state);
        this.closeForm();
        document.removeEventListener('keydown', this.handleEscKeyDown);
      },
      onFormCancel: () => {
        this.closeForm();
        document.removeEventListener('keydown', this.handleEscKeyDown);
      },
    });

    this.#baseContainer = document.querySelector('.trip-events ul.trip-events__list');
    if(this.#baseContainer) {
      render(this.#formComponent, this.#baseContainer, RenderPosition.AFTERBEGIN);
    } else {
      render(this.#formComponent, this.generateContainer(), RenderPosition.AFTERBEGIN);
    }


    document.addEventListener('keydown', this.handleEscKeyDown);

    this.#addButton.disabled = true;

  };

  constructor (currentEditIdController, userActionsHandler) {
    //this.#baseContainer = baseContainer;
    // this.#currentEditId = currentEditId;
    this.#currentEditIdController = currentEditIdController;
    this.#userActionsHandler = userActionsHandler;
  }

}
