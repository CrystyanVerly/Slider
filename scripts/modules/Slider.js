import throttle from './throttle.js';

export default class Slider {
  constructor({ wrapper, rail, config = {} }) {
    this.wrapper = document.querySelector(wrapper);
    this.rail = document.querySelector(rail);

    if (!wrapper || !rail) console.warn(`'wrapper' or 'rail' not found.`);

    this.config = {
      module: 'step', // step → 1 by 1 | paged → perView by perView
      perView: 1,

      ...config,
    };

    this.distance = { inicial: 0, moving: 0, final: 0 };

    this.binder();
  }
  init() {
    this.mainListener();
  }

  binder() {
    const toBind = ['onStart', 'onMoving', 'onFinal'];
    toBind.forEach((m) => (this[m] = this[m].bind(this)));

    this.onMoving = throttle(this.onMoving.bind(this), 16);
  }

  mainListener() {
    this.wrapper.addEventListener('pointerdown', this.onStart);
  }

  onStart(e) {
    e.preventDefault();
    this.distance.inicial = Math.round(e.clientX);
    this.wrapper.addEventListener('pointermove', this.onMoving);
    this.wrapper.addEventListener('pointerup', this.onFinal);
  }
  onMoving() {
    console.log('moveu');
  }
  onFinal() {
    console.log('terminou');
    this.wrapper.removeEventListener('pointermove', this.onMoving);
    this.wrapper.removeEventListener('pointerup', this.onFinal);
  }
}
