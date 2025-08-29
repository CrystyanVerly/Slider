export function onStart(e) {
	e.preventDefault();
	this.distance.initial = Math.round(e.clientX);
	this.wrapper.addEventListener('pointermove', this.onMoving);
	this.wrapper.addEventListener('pointerup', this.onFinal);
}

export function onMoving({ clientX }) {
	this.moveItem(this.trackOnMoving(clientX), false);
}

export function onFinal() {
	this.wrapper.removeEventListener('pointermove', this.onMoving);
	this.wrapper.removeEventListener('pointerup', this.onFinal);
	this.goTo();
}

export function trackOnMoving(clientX) {
	const calcDist = Math.round((clientX - this.distance.initial) * 1.1);
	this.distance.moving = calcDist;
	return this.distance.final + calcDist;
}

export function moveItem(distX, transition = true) {
	this.rail.style.transform = `translate3d(${distX}px, 0, 0)`;
	this.rail.style.transition = transition ? `transform .3s ease` : 'none';
}

export function upDateFinalDistance() {
	return (this.distance.final = Math.round(
		-(this.activeIndex * this.itemWidth),
	));
}

export function changeDragging() {
	const minMove = this.wrapperWidth * 0.1;
	const userMoving = this.distance.moving;
	if (userMoving > minMove) this.prevItem();
	else if (userMoving < -minMove) this.nextItem();
}

export function goTo() {
	this.changeDragging();
	this.upDateFinalDistance();
	this.moveItem(this.distance.final);
}
