import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.scss']
})
export class EditarPublicacionComponent {
  @Input() publicacion!: Publicacion; // Recibir la publicación seleccionada

  constructor(
    private modalController: ModalController,
    private publicacionService: PublicacionService,
    private auth: Auth,
    private router: Router
  ) {}

  // Cerrar el modal sin guardar cambios
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Guardar los cambios en la publicación
  async guardarCambios() {
    try {
      await this.publicacionService.actualizarPublicacion(this.publicacion.id, this.publicacion);
      this.modalController.dismiss(); // Cerrar el modal al guardar
    } catch (error) {
      console.error('Error al actualizar la publicación:', error);
    }
  }

  // Eliminar la publicación
  async eliminarPublicacion() {
    const userId = this.publicacion.id; // Asegúrate de tener el ID de usuario autenticado
    if (userId) {
      try {
        await this.publicacionService.eliminarPublicacion(userId, this.publicacion.id);
        this.modalController.dismiss(); // Cerrar el modal tras eliminar
      } catch (error) {
        console.error('Error al eliminar la publicación:', error);
      }
    }
  }
}

