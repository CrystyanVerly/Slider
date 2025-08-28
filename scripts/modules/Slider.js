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
      firstItem: 0,
      perView: 1,
      looping: true,
      ...config,
    };

    this.distance = { initial: 0, moving: 0, final: 0 };
    this.index = {
      active: this.config.firstItem,
      isForward: true,
      clamp: this.clampLastIndex,
      last: this.realItems.length,
    };

    this.binder();
  }

  init() {
    this.setupInitialPosition();
    this.mainListener();
    this.setUpIfCloning();
  }

  binder() {
    const toBind = ['onStart', 'onFinal', 'goToIfLooping'];
    toBind.forEach((m) => (this[m] = this[m].bind(this)));

    this.onMoving = throttle(this.onMoving.bind(this), 16);
    this.onResizing = throttle(this.onResizing.bind(this), 200);
  }

  mainListener() {
    this.wrapper.addEventListener('pointerdown', this.onStart);
    this.wrapper.style.setProperty('--items-perView', this.perView);
    window.addEventListener('resize', this.onResizing);
  }

  setupInitialPosition() {
    this.activeIndex = this.trimEdges(this.activeIndex);
    this.upDateFinalDistance();
    this.moveItem(this.distance.final, false);
  }

  setUpIfCloning() {
    if (!this.config.looping) return;
    this.rail.addEventListener('transitionend', this.goToIfLooping);
    this.cloneIfLoop();
    this.startWithLooping();
  }

  get module() {
    return this.config.module;
  }
  get perView() {
    return this.config.perView;
  }
  get realItems() {
    const realItems = [...this.rail.children].filter(
      (el) => !el.classList.contains(this.classClone),
    );
    return realItems;
  }
  get activeIndex() {
    return this.index.active;
  }
  set activeIndex(value) {
    return (this.index.active = this.trimEdges(value));
  }
  get clampLastIndex() {
    return Math.max(0, this.realItems.length - this.perView);
  }
  get wrapperWidth() {
    return this.wrapper.offsetWidth;
  }
  get itemWidth() {
    return this.wrapperWidth / this.perView;
  }
  get totalPages() {
    return Math.floor(this.realItems.length / this.perView);
  }

  get itemsWithClones() {
    return [...this.rail.children];
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

  upDateFinalDistance() {
    return (this.distance.final = Math.round(
      -(this.activeIndex * this.itemWidth),
    ));
  }

  onResizing() {
    setTimeout(() => this.goTo(), 200);
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
    if (this.config.looping) return index;

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
    this.upDateFinalDistance();
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

  cloneIfLoop() {
    const elements = this.realItems;
    const nPerView = this.perView;

    if (elements.length <= nPerView) return;

    this.classClone = 'clonedItems';

    for (let i = 0; i < nPerView; i++) {
      const clone = elements[i].cloneNode(true);
      clone.classList.add(this.classClone);
      this.rail.appendChild(clone);
    }

    for (let i = elements.length - nPerView; i < elements.length; i++) {
      const clone = elements[i].cloneNode(true);
      clone.classList.add(this.classClone);
      this.rail.insertBefore(clone, elements[0]);
    }
  }

  goToIfLooping() {
    if (this.isClone(this.activeIndex)) {
      this.getRealIndex(this.activeIndex);
      this.upDateFinalDistance();
      this.rail.offsetHeight;
      this.moveItem(this.distance.final, false);
    }
  }

  startWithLooping() {
    this.activeIndex = this.perView;
    this.upDateFinalDistance();
    this.moveItem(this.distance.final, false);
  }

  isClone(index) {
    const verify = this.itemsWithClones[index].classList.contains(
      this.classClone,
    );
    return verify;
  }

  getRealIndex(index) {
    const totalReals = this.realItems.length;
    const perView = this.perView;
    const realRelative =
      (((index - perView) % totalReals) + totalReals) % totalReals;
    this.activeIndex = perView + realRelative;
    return realRelative;
  }
}
