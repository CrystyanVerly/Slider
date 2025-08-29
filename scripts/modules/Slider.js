import * as drag from './drag/dragHandlers.js';
import * as loop from './loop/loopHandlers.js';
import * as direction from './direction/directionHandlers.js';
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
			module: 'step', // step → 1 by 1 | page → by perView
			firstItem: 0,
			perView: 3,
			looping: false,
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
		Object.assign(this, drag, loop, direction);

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

	onResizing() {
		setTimeout(() => this.goTo(), 200);
	}

	trimEdges(index) {
		if (this.config.looping) return index;
		if (index < 0) return 0;
		if (index > this.clampLastIndex) return this.clampLastIndex;
		return index;
	}

	/* ===== GETTERS ===== */
	get module() {
		return this.config.module;
	}
	get perView() {
		return this.config.perView;
	}
	get realItems() {
		return [...this.rail.children].filter(
			(el) => !el.classList.contains(this.classClone),
		);
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
}
