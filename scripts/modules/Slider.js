import throttle from './throttle.js';

export default class Slider {
  constructor({ wrapper, rail, config = {} }) {
    this.wrapper = document.querySelector(wrapper);
    this.rail = document.querySelector(rail);

    if (!this.wrapper || !this.rail) {
      console.warn(`'wrapper' or 'rail' not found.`);
      return;
    }

    this.config = {
      module: 'step', // step → 1 by 1 | paged → perView by perView
      firstItem: 4,
      perView: 3,
      looping: false,
      ...config,
    };

    this.distance = { initial: 0, moving: 0, final: 0 };
    this.index = {
      active: this.config.firstItem,
      isForward: true,
      clamp: this.clampLastIndex,
      last: this.totalItems.length,
    };

    this.binder();
  }

  init() {
    this.setupInitialPosition();
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

  setupInitialPosition() {
    this.activeIndex = this.trimEdges(this.activeIndex);
    this.distance.final = -(this.activeIndex * this.itemWidth);
    this.moveItem(this.distance.final, false);
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
  get activeIndex() {
    return this.index.active;
  }
  set activeIndex(value) {
    return (this.index.active = this.trimEdges(value));
  }
  get clampLastIndex() {
    return Math.max(0, this.totalItems.length - this.perView);
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
    this.moveItem(this.trackOnMoving(clientX), false);
  }

  onFinal() {
    this.wrapper.removeEventListener('pointermove', this.onMoving);
    this.wrapper.removeEventListener('pointerup', this.onFinal);
    this.goTo();
  }

  trackOnMoving(clientX) {
    const calcDist = Math.round((clientX - this.distance.initial) * 1.1);
    this.distance.moving = calcDist;
    return this.distance.final + calcDist;
  }

  moveItem(distX, transition = true) {
    this.rail.style.transform = `translate3d(${distX}px, 0, 0)`;
    this.rail.style.transition = transition ? `transform .3s ease` : 'none';
  }

  trimEdges(index) {
    if (index < 0) return 0;
    if (index > this.clampLastIndex) return this.clampLastIndex;
    return index;
  }

  changeDragging() {
    const minMove = this.wrapperWidth * 0.1;
    const userMoving = this.distance.moving;
    if (userMoving > minMove) this.prevItem();
    else if (userMoving < -minMove) this.nextItem();
  }

  goTo() {
    this.changeDragging();
    this.distance.final = -(this.activeIndex * this.itemWidth);
    this.moveItem(this.distance.final);
  }

  setDirection(direction, e) {
    e?.preventDefault();
    const chosenModule = this.module === 'step' ? 1 : this.perView;
    this.activeIndex += chosenModule * direction;
    if (!this.config.looping) this.index.isForward = direction > 0;
    return this.index.isForward;
  }

  prevItem(e) {
    this.setDirection(-1, e);
  }

  nextItem(e) {
    this.setDirection(1, e);
  }
}
