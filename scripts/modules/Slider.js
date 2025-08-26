export default class Slider {
  constructor({ wrapper, rail, config = {} }) {
    this.wrapper = document.querySelector(wrapper);
    this.rail = document.querySelector(rail);

    if (!wrapper || !rail) console.warn(`'wrapper' or 'rail' not found.`);

    this.binder();
  }
  init() {
    this.mainListener();
  }

  binder() {
    const toBind = ['onStart'];
    toBind.forEach((m) => (this[m] = this[m].bind(this)));
  }

  onStart() {
    console.log('hello, world!');
  }
  mainListener() {
    this.wrapper.addEventListener('pointerdown', this.onStart);
  }
}
