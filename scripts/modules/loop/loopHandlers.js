export function cloneIfLoop() {
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

export function goToIfLooping() {
	if (this.isClone(this.activeIndex)) {
		this.getRealIndex(this.activeIndex);
		this.upDateFinalDistance();
		this.rail.offsetHeight;
		this.moveItem(this.distance.final, false);
	}
}

export function startWithLooping() {
	this.activeIndex = this.perView;
	this.upDateFinalDistance();
	this.moveItem(this.distance.final, false);
}

export function isClone(index) {
	return this.itemsWithClones[index].classList.contains(this.classClone);
}

export function getRealIndex(index) {
	const totalReals = this.realItems.length;
	const perView = this.perView;
	const realRelative =
		(((index - perView) % totalReals) + totalReals) % totalReals;
	this.activeIndex = perView + realRelative;
	return realRelative;
}
