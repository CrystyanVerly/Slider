export function setDirection(direction, e) {
	e?.preventDefault();
	const chosenModule = this.module === 'step' ? 1 : this.perView;
	this.activeIndex += chosenModule * direction;
	if (!this.config.looping) this.index.isForward = direction > 0;
	return this.index.isForward;
}

export function prevItem(e) {
	this.setDirection(-1, e);
}

export function nextItem(e) {
	this.setDirection(1, e);
}
