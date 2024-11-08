import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importar ToastController
import { AlertController } from '@ionic/angular';

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
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // Cerrar el modal sin guardar cambios
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Guardar los cambios de la publicación
  async guardarCambios() {
    const data: Partial<Publicacion> = {
      titulolibro: this.publicacion.titulolibro,
      autor: this.publicacion.autor,
      genero: this.publicacion.genero,
      estado: this.publicacion.estado,
      correoelectronico: this.publicacion.correoelectronico,
      telefono: this.publicacion.telefono,
      precio: this.publicacion.precio,
      descripcion: this.publicacion.descripcion,
      anio: this.publicacion.anio
    };
    
    // Actualizamos la publicación
    await this.publicacionService.actualizarPublicacion(this.publicacion.id, data);
    this.mostrarToast('Publicación actualizada exitosamente');
    this.modalController.dismiss();
  }

  

// Eliminar la publicación con confirmación
async eliminarPublicacion() {
  const userId = this.auth.currentUser?.uid; // Obtener el ID del usuario autenticado
  if (userId) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            // Llamar al servicio para eliminar la publicación
            await this.publicacionService.eliminarPublicacion(userId, this.publicacion.id);
            this.mostrarToast('Publicación eliminada exitosamente');
            this.modalController.dismiss(); // Cerrar el modal después de eliminar
          }
        }
      ],
      cssClass: 'alert-custom', // Aplica el estilo general de la alerta
    });

    await alert.present(); // Mostrar la alerta de confirmación
  } else {
    console.error('No se encontró el usuario autenticado');
  }
}

  // Método para mostrar el toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000, // Duración de 2 segundos
      position: 'bottom',
    });
    toast.present();
  }
}

