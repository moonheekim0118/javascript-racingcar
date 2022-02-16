import Car from './class/Car.js';
import View from './class/View.js';
import { SELECTOR, MESSAGE } from './constants.js';
import { $, getInputValue, getEnterEvent } from './utils/dom.js';
import {
  parseCarName,
  getCarsPositions,
  getMaxCount,
} from './utils/racingGame.js';
import {
  isAvailableCarNameLength,
  isNotDuplicatedCarNames,
  isAvailableRacingCount,
  isInteger,
} from './utils/validations.js';
import { getTimeInSecond } from './utils/general.js';

class RacingCarGame {
  constructor() {
    this.cars = [];
    this.winners = [];
    this.view = new View();
    this.bindEvents();
  }

  bindEvents() {
    $(SELECTOR.CAR_NAMES_BUTTON).addEventListener('click', ({ target }) =>
      this.onSubmitCarName(getInputValue(target.parentElement)),
    );
    $(SELECTOR.RACING_COUNT_BUTTON).addEventListener('click', ({ target }) =>
      this.onSubmitRacingCount(+getInputValue(target.parentElement)),
    );
    $(SELECTOR.RESTART_BUTTON).addEventListener('click', () =>
      this.onClickRestart(),
    );
    $(SELECTOR.CAR_NAMES_INPUT).addEventListener('keyup', ({ key, target }) =>
      getEnterEvent(key, () => this.onSubmitCarName(target.value)),
    );
    $(SELECTOR.RACING_COUNT_INPUT).addEventListener(
      'keyup',
      ({ key, target }) =>
        getEnterEvent(key, () => this.onSubmitRacingCount(+target.value)),
    );
  }

  onSubmitCarName(names) {
    const carNames = parseCarName(names);
    if (!isAvailableCarNameLength(carNames)) {
      return alert(MESSAGE.WRONG_NAME_LENGTH);
    }
    if (!isNotDuplicatedCarNames(carNames)) {
      return alert(MESSAGE.DUPLICATE_NAME);
    }
    this.cars = carNames.map(name => new Car(name));
    this.view.showRacingCountInput();
  }

  onSubmitRacingCount(count) {
    if (!isAvailableRacingCount(count)) {
      return alert(MESSAGE.WRONG_COUNT);
    }
    if (!isInteger(count)) {
      return alert(MESSAGE.NOT_DECIMAL_COUNT);
    }
    this.startGame(count);
  }

  onClickRestart() {
    this.cars = [];
    this.winners = [];
    this.view.restartGame();
  }

  getWinner() {
    const maxCount = getMaxCount(this.cars);
    return (this.winners = this.cars.filter(
      car => car.racingCount === maxCount,
    ));
  }

  startGame(count) {
    this.view.renderRacingStatus(this.cars);
    this.progressGame(count);
  }

  endGame() {
    this.view.removeSpinners();
    this.view.renderWinners(this.getWinner());
  }

  progressGame(count) {
    let start = 0;
    let before = 0;
    let isLoading = true;

    const progressBySecond = timestamp => {
      const timeInSecond = getTimeInSecond(timestamp);
      if (!start) {
        start = timeInSecond;
      }
      const progress = timeInSecond - start;
      if (progress === count) {
        this.endGame();
        window.cancelAnimationFrame(progressBySecond);
        return;
      }
      if (isLoading) {
        this.view.renderSpinners();
        isLoading = false;
      }
      if (before !== progress) {
        this.view.renderMoveStatus(getCarsPositions(this.cars));
        before = progress;
        isLoading = true;
      }
      window.requestAnimationFrame(progressBySecond);
    };
    window.requestAnimationFrame(progressBySecond);
  }
}

new RacingCarGame();
