import { AuthService } from 'src/services/auth.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { DetallesPublicacionComponent } from '../detalles-publicacion/detalles-publicacion.component';
import { UsuarioService } from 'src/services/usuario.service';
@Component({
  selector: 'app-inicio',
  templateUrl: 'inicio.page.html',
  styleUrls: ['inicio.page.scss']
})
export class inicioPage implements OnInit {
  user: any;
  publicaciones$! : Observable<Publicacion[]>;

  constructor(
    private publicacionService: PublicacionService, 
    private modalController: ModalController,
    private authService: AuthService,
    private usuarioService: UsuarioService) {
    
  }
  ngOnInit(): void {
    this.publicaciones$ = this.publicacionService.obtenerTodasLasPublicaciones();
    this.authService.getUser().subscribe(async user => {
      this.user = user;
      if (user) {
        await this.loadUserData(user.id);
      }
    });
  }

  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
  }

 // Método para abrir el modal con detalles completos de la publicación
 async abrirModal(publicacion: Publicacion) {
  const modal = await this.modalController.create({
    component: DetallesPublicacionComponent, // Componente para mostrar detalles completos
    componentProps: { publicacion } // Pasamos la publicación al modal
  });
  return await modal.present();
}

}
