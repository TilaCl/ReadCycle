import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],

})


export class TabsPage {

  constructor(private router: Router) {}  // Inyecta el Router

  // Función para navegar a tab3
  goToTab3() {
    this.router.navigate(['/tabs/tab3']);  // Redirige al tab3
  }
}
