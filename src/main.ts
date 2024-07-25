import './assets/style.scss';
import Game from './classes/Game';
const appContainer: HTMLDivElement | null = document.querySelector('#app');
const game = new Game(appContainer as HTMLDivElement, 3);
game.newGame();
if (module.hot) {
  module.hot.accept((err) => {
    if (err) {
      console.log('HMR', err);
    }
  });
}
