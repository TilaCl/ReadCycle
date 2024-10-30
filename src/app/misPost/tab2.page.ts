import { Component, OnInit } from '@angular/core';
import { PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Publicacion } from 'src/services/publicacion.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  publicaciones$: Observable<Publicacion[]> = new Observable<Publicacion[]>(); // Observable para las publicaciones

  constructor(
    private publicacionService: PublicacionService,
    private auth: Auth) 
    {}

  ngOnInit() {
    this.cargarPublicaciones(); // Cargar las publicaciones al iniciar la página
  }

  // Método para obtener todas las publicaciones del usuario autenticado
  cargarPublicaciones() {
    const userId = this.auth.currentUser?.uid;
    if (userId) {
      this.publicaciones$ = this.publicacionService.obtenerPublicacionesDeUsuario(userId);
    } else {
      console.error('Usuario no autenticado');
    }
  }

    

}
