import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    toggleDarkTheme(prefersDark.matches); // Aplica el tema al iniciar

    prefersDark.addEventListener('change', (mediaQuery) =>
      toggleDarkTheme(mediaQuery.matches)
    );
  }


}

function toggleDarkTheme(shouldAdd: boolean) {
  document.body.classList.toggle('dark', shouldAdd);
}
