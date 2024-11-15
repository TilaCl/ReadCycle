import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importar ToastController
import { AlertController } from '@ionic/angular';
import { ImageUploadService } from 'src/services/image-upload.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.scss']
})
export class EditarPublicacionComponent implements OnInit{
  @Input() publicacion!: Publicacion; // Recibir la publicación seleccionada
  imagePreviewUrls: string[] = [];
  selectedFiles: File[] = [];
  imagesToDelete: string[] = [];
  maxYear = new Date().getFullYear().toString();
  minYear = '1900';
  autores: string[] = [];
  generos: string[] = [];
  autoresFiltrados: string[] = [];
  generosFiltrados: string[] = [];
  mostrarSugerenciasGenero = false;
  mostrarSugerenciasAutor = false;

  constructor(
    private modalController: ModalController,
    private publicacionService: PublicacionService,
    private auth: Auth,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private imageUploadService: ImageUploadService,
    private http: HttpClient, 
  ) {}
  ngOnInit() {
    // Inicializar imagenesUrl si no existe
    if (!this.publicacion.imagenesUrl) {
      this.publicacion.imagenesUrl = [];
    }
  }

  get currentImagesCount(): number {
    return (this.publicacion.imagenesUrl?.length || 0) + this.imagePreviewUrls.length;
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 3 - this.currentImagesCount;
      const filesToAdd = Array.from(files).slice(0, remainingSlots) as File[];
  
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
          this.selectedFiles.push(file);
        };
        reader.readAsDataURL(file);
      });
  
      console.log("Archivos seleccionados:", this.selectedFiles); // <-- Verifica los archivos aquí
    }
  }

  removeExistingImage(index: number) {
    if (this.publicacion.imagenesUrl) {
      const imageUrl = this.publicacion.imagenesUrl[index];
      this.imagesToDelete.push(imageUrl);
      this.publicacion.imagenesUrl = this.publicacion.imagenesUrl.filter((_, i) => i !== index);
    }
  }

  removeNewImage(index: number) {
    this.imagePreviewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

 cargarAutores() {
    this.http.get<string[]>('/assets/autor.json').subscribe(data => {
      this.autores = data;
    });
  }

  cargarGeneros() {
    this.http.get<string[]>('/assets/genero.json').subscribe(data => {
      this.generos = data;
    });
  }

  filtrarGeneros(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.generosFiltrados = this.generos.filter(genero => genero.toLowerCase().includes(valor));
      this.mostrarSugerenciasGenero = this.generosFiltrados.length > 0;
    } else {
      this.mostrarSugerenciasGenero = false;
    }
  }

  filtrarAutores(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.autoresFiltrados = this.autores.filter(autor => autor.toLowerCase().includes(valor));
      this.mostrarSugerenciasAutor = this.autoresFiltrados.length > 0;
    } else {
      this.mostrarSugerenciasAutor = false;
    }
  }

  seleccionarGenero(genero: string) {
    this.publicacion.genero = genero;
    this.mostrarSugerenciasGenero = false;
  }

  seleccionarAutor(autor: string) {
    this.publicacion.autor = autor;
    this.mostrarSugerenciasAutor = false;
  }
  onYearChange(event: any) {
    // Extract only the year from the datetime value
    const fullDate = event.detail.value;
    this.publicacion.anio = parseInt(fullDate.split('-')[0], 10);
  }


  // Validación del campo "Año" para asegurarse de que no exceda los 4 dígitos
  validateLength(event: any) {
    const input = event.target.value;
    if (input.length > 4) {
      event.target.value = input.slice(0, 4);  // Limita a 4 caracteres
    }
  }

  async guardarCambios() {
    try {
      const loading = await this.publicacionService.showLoading();
  
      // Verifica si hay archivos en selectedFiles
      if (this.selectedFiles.length > 0) {
        const nuevasImagenesUrl = await Promise.all(this.selectedFiles.map((file, index) => {
          const filePath = `postImg/${this.auth.currentUser?.uid}/${this.publicacion.id}/imagen_nueva_${index}`;
          console.log("Cargando imagen:", filePath); // <-- Agrega este registro
          return this.imageUploadService.uploadImage(file, filePath).toPromise();
        }));
  
        const filteredNuevasImagenesUrl = nuevasImagenesUrl.filter((url): url is string => url !== undefined);
        
        // Actualiza el array de URLs de imagen con las nuevas URLs
        this.publicacion.imagenesUrl = [
          ...(this.publicacion.imagenesUrl || []).filter(url => !this.imagesToDelete.includes(url)),
          ...filteredNuevasImagenesUrl
        ].slice(0, 5);
      }
  
      // Código de actualización de publicación
      const data: Partial<Publicacion> = {
        titulolibro: this.publicacion.titulolibro,
        autor: this.publicacion.autor,
        genero: this.publicacion.genero,
        estado: this.publicacion.estado,
        correoelectronico: this.publicacion.correoelectronico,
        telefono: this.publicacion.telefono,
        precio: this.publicacion.precio,
        descripcion: this.publicacion.descripcion,
        anio: this.publicacion.anio,
        imagenesUrl: this.publicacion.imagenesUrl
      };
  
      await this.publicacionService.actualizarPublicacion(this.publicacion.id, data);
      await loading.dismiss();
      this.mostrarToast('Publicación actualizada exitosamente');
      this.modalController.dismiss();
    } catch (error) {
      console.error('Error al actualizar la publicación:', error);
      this.mostrarToast('Error al actualizar la publicación');
    }
  }
  

// Eliminar la publicación con confirmación
async eliminarPublicacion() {
  const userId = this.auth.currentUser?.uid;
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
            const loading = await this.publicacionService.showLoading();
            try {
              // Eliminar todas las imágenes asociadas si existen
              if (this.publicacion.imagenesUrl?.length) {
                await Promise.all(this.publicacion.imagenesUrl.map(url => 
                  this.imageUploadService.deleteImage(url)
                ));
              }
              
              // Eliminar la publicación
              await this.publicacionService.eliminarPublicacion(userId, this.publicacion.id);
              await loading.dismiss();
              this.mostrarToast('Publicación eliminada exitosamente');
              this.modalController.dismiss();
            } catch (error) {
              await loading.dismiss();
              console.error('Error al eliminar la publicación:', error);
              this.mostrarToast('Error al eliminar la publicación');
            }
          }
        }
      ],
      cssClass: 'alert-custom',
    });

    await alert.present();
  } else {
    console.error('No se encontró el usuario autenticado');
  }
}

async mostrarToast(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 2000,
    position: 'bottom',
  });
  toast.present();
}
}

