import { Component, OnInit } from '@angular/core';
import { PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Publicacion } from 'src/services/publicacion.service';
import { ModalController } from '@ionic/angular'; // Importamos ModalController
import { EditarPublicacionComponent } from '../editar-publicacion/editar-publicacion.component';
import { DetallesPublicacionComponent } from '../detalles-publicacion/detalles-publicacion.component';
import { AuthService } from 'src/services/auth.service';
import { UsuarioService } from 'src/services/usuario.service';
import { LoadingController } from '@ionic/angular';
import {  Router } from '@angular/router';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  publicaciones$: Observable<Publicacion[]> = new Observable<Publicacion[]>(); // Observable para las publicaciones
  user: any;
  constructor(
    private publicacionService: PublicacionService,
    private auth: Auth,
    private modalController: ModalController,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private router: Router
  ) 
    {}
  
  ngOnInit() {
    this.cargarData()

  }

  creaLibros(){
    this.router.navigate(['/tabs/tab3']);
  }
  async cargarData(){
    const loading = await this.showLoading();
    this.authService.getUser().subscribe(async user => {
      this.user = user;
      if (user) {
        await this.loadUserData(user.id);
        this.cargarPublicaciones(); // Cargar las publicaciones al iniciar la página
      }
    });
    loading.dismiss();
  }
  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
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
  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento',
      spinner: 'bubbles',
      duration: 5000 // Tiempo máximo en ms, ajusta si es necesario
    });
    await loading.present();
    return loading;
  }
  // Método para abrir el modal con detalles completos de la publicación
  async abrirModal(publicacion: Publicacion) {
    const modal = await this.modalController.create({
      component: DetallesPublicacionComponent, // Componente para mostrar detalles completos
      componentProps: { publicacion } // Pasamos la publicación al modal
    });
    return await modal.present();
  }

// Método para abrir el modal de edición
async editarPublicacion(publicacion: Publicacion, event: Event) {
  event.stopPropagation(); // Evita abrir el modal de detalles

  const modal = await this.modalController.create({
    component: EditarPublicacionComponent,
    componentProps: { publicacion }
  });
  await modal.present();
}

    

}
