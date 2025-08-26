import Slider from './modules/Slider.js';

const banner = new Slider({
  wrapper: '[data-slider="wrapper"]',
  rail: '[data-slider="rail"]',
});
console.log(banner);
banner.init();
