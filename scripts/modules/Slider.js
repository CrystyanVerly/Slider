import throttle from './throttle.js';

export default class Slider {
  constructor({ wrapper, rail, config = {} }) {
    this.wrapper = document.querySelector(wrapper);
    this.rail = document.querySelector(rail);

    if (!wrapper || !rail) console.warn(`'wrapper' or 'rail' not found.`);

    this.config = {
      module: 'step', // step → 1 by 1 | paged → perView by perView
      perView: 4,
      looping: false,

      ...config,
    };

    this.distance = { initial: 0, moving: 0, final: 0 };
    this.index = {
      // proximo dia: mapear item e index que estao ativos em tela
      active: 0,
      isForward: true,
      last: this.lastItem,
    };

    this.binder();
  }

  init() {
    this.mainListener();
  }

  binder() {
    const toBind = ['onStart', 'onFinal'];
    toBind.forEach((m) => (this[m] = this[m].bind(this)));

    this.onMoving = throttle(this.onMoving.bind(this), 16);
  }

  mainListener() {
    this.wrapper.addEventListener('pointerdown', this.onStart);
    this.wrapper.style.setProperty('--items-perView', this.perView);
  }

  get module() {
    return this.config.module;
  }
  get perView() {
    return this.config.perView;
  }
  get totalItems() {
    return [...this.rail.children];
  }
  get activeItem() {
    return this.index.active;
  }
  set activeItem(value) {
    return (this.index.active = this.trimEdges(value));
  }
  get lastItem() {
    return this.totalItems.length - 1;
  }
  get wrapperWidth() {
    return this.wrapper.offsetWidth;
  }
  get itemWidth() {
    return this.wrapperWidth / this.perView;
  }
  get totalPages() {
    return Math.ceil(this.totalItems.length / this.perView);
  }

  onStart(e) {
    e.preventDefault();
    this.distance.initial = Math.round(e.clientX);
    this.wrapper.addEventListener('pointermove', this.onMoving);
    this.wrapper.addEventListener('pointerup', this.onFinal);
  }

  onMoving({ clientX }) {
    this.moveItem(this.trackOnMoving(clientX));
    console.log(this.distance);
  }

  onFinal() {
    console.log('terminou');
    this.wrapper.removeEventListener('pointermove', this.onMoving);
    this.wrapper.removeEventListener('pointerup', this.onFinal);
    this.changeItem();
    this.activeItem = this.trimEdges(this.activeItem);
    this.distance.final = -(this.activeItem * this.itemWidth);
    this.moveItem(this.distance.final);
  }

  trackOnMoving(clientX) {
    const calcDist = Math.round((clientX - this.distance.initial) * 1.1);
    this.distance.moving = calcDist;
    return this.distance.final + calcDist;
  }

  moveItem(distX, transition = true) {
    this.rail.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  trimEdges(index) {
    const maxIndex = this.lastItem;
    const maxPaged = maxIndex - this.perView + 1;

    if (index < 0) return 0;
    if (this.module === 'paged' && index > maxPaged) return maxPaged;
    if (this.module === 'step' && index - 1 === maxPaged) return index - 1;

    return index;
  }

  changeItem() {
    const minMove = this.wrapperWidth * 0.1;
    const userMoving = this.distance.moving;

    if (userMoving > minMove) this.prevItem();
    else if (userMoving < -minMove) this.nextItem();
    else this.moveItem(this.distance.final);
  }

  prevItem(e) {
    e?.preventDefault();
    if (this.module === 'step') this.activeItem--;
    else if (this.module === 'paged') this.activeItem -= this.perView;
  }

  nextItem(e) {
    e?.preventDefault();
    if (this.module === 'step') this.activeItem++;
    else if (this.module === 'paged') this.activeItem += this.perView;
  }
}
