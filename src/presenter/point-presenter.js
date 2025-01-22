import FormEditView from '../view/form-edit-view';
import PointView from '../view/point-view';
import {render, replace} from '../framework/render.js';
import {UserAction} from '../constants/user-action.js';
import {UpdateType} from '../constants/update-type.js';


export default class PointPresenter {

  #container = null;
  #currentEditIdController = null;
  #point = null;
  #prevPointComponent = null;
  #prevFormEditComponent = null;
  #pointComponent = null;
  #formEditComponent = null;
  #currentEditId = {editID: undefined};
  #userActionsHandler;

  replacePointToEditForm = () => {
    replace(this.#formEditComponent, this.#pointComponent);
  };

  replaceEditFormToPoint = () => {
    replace(this.#pointComponent, this.#formEditComponent);
    this.#currentEditId.editID = undefined;
  };

  escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.replaceEditFormToPoint();
      document.removeEventListener('keydown', this.escKeyDownHandler);
    }
  };

  renderPoint = (point) => {

    this.#point = structuredClone(point);

    this.#pointComponent = new PointView({
      point: this.#point,
      onEditClick: () => {
        this.#currentEditIdController(this.#point.id);
        this.replacePointToEditForm();
        document.addEventListener('keydown', this.escKeyDownHandler);
      },
      onFavoriteButtonClick: (pointData) => {
        pointData.isFavorite = !pointData.isFavorite;
        this.#userActionsHandler(UserAction.POINT_PATCH, UpdateType.PATCH, pointData);
      },
    }
    );

    this.#formEditComponent = new FormEditView({
      point: this.#point,
      onFormSubmit: (state) => {
        this.#userActionsHandler(UserAction.POINT_PATCH, UpdateType.PATCH, state);
        this.replaceEditFormToPoint();
        document.removeEventListener('keydown', this.escKeyDownHandler);
      },
      onExit: () => {
        this.replaceEditFormToPoint();
        document.removeEventListener('keydown', this.escKeyDownHandler);
      },
      onDelete: (state) => {
        this.#userActionsHandler(UserAction.DELETE, UpdateType.MINOR, state);
        this.replaceEditFormToPoint();
        document.removeEventListener('keydown', this.escKeyDownHandler);
      },
    });


    if(this.#prevPointComponent === null && this.#prevFormEditComponent === null) {
      render(this.#pointComponent, this.#container.element);
    } else {
      if(this.#prevPointComponent.element.parentElement) {
        replace(this.#pointComponent, this.#prevPointComponent);
      }
      if(this.#prevFormEditComponent.element.parentElement) {
        replace(this.#formEditComponent, this.#prevFormEditComponent);
      }
    }
    this.#prevPointComponent = this.#pointComponent;
    this.#prevFormEditComponent = this.#formEditComponent;
  };

  constructor (container, currentEditId, currentEditIdController, userActionsHandler) {
    this.#container = container;
    this.#currentEditId = currentEditId;
    this.#currentEditIdController = currentEditIdController;
    this.#userActionsHandler = userActionsHandler;
  }

}
