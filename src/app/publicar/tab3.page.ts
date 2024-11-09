import { GeocodingService } from './../../services/geocoding.service';
import { Component } from '@angular/core';
import { UsuarioService } from 'src/services/usuario.service';
import { PublicacionService } from 'src/services/publicacion.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  publicacion = {
    titulolibro: '',
    autor: '',
    genero: '',
    estado: '',
    correoelectronico: '',
    telefono: 0,
    precio: 0,
    descripcion: '',
    anio: 0,
    coordenadas: { lat: 0, lng: 0 }
  };
  fotos: File[] = []; // Array para almacenar las fotos seleccionadas

  constructor(
    private usuarioService: UsuarioService,
    private geocodingService: GeocodingService,
    private publicacionService: PublicacionService,
    private auth: Auth,
    private router: Router,
    private toastController: ToastController,
    private imageUploadService: ImageUploadService
  ) { }

  // Validación del campo "Año" para asegurarse de que no exceda los 4 dígitos
  validateLength(event: any) {
    const input = event.target.value;
    if (input.length > 4) {
      event.target.value = input.slice(0, 4);  // Limita a 4 caracteres
    }
  }

  // Evento para manejar la selección de imágenes
  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files.length > 3) {
      this.mostrarToast('Solo puedes seleccionar hasta 3 imágenes');
      return;
    }
    this.fotos = Array.from(files);
  }

  // Método para guardar la publicación
  async guardarPublicacion() {
    const { titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio } = this.publicacion;
    
    try {
      // Obtener las coordenadas usando geocodingService
      const coordenadas = await this.geocodingService.obtenerUbicacion();
      
      // Verificar que las coordenadas estén definidas
      if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
        throw new Error('No se pudo obtener la ubicación.');
      }
  
      // Crear la publicación con coordenadas
      const publicacionId = await this.publicacionService.crearPublicacion(
        titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio, coordenadas
      );
      console.log('Publicación creada con éxito');
  
      // Subir las imágenes seleccionadas y obtener sus URLs
      const imagenesUrl = await Promise.all(this.fotos.map((foto, index) => {
        const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
        return this.imageUploadService.uploadImage(foto, filePath).toPromise();
      }));
  
      // Filtrar valores undefined para asegurar que imagenesUrl sea de tipo string[]
      const filteredImagenesUrl = imagenesUrl.filter((url): url is string => url !== undefined);
  
      // Actualizar la publicación con las URLs de las imágenes en Firestore
      await this.publicacionService.actualizarPublicacion(publicacionId, { imagenesUrl: filteredImagenesUrl });
  
      // Resetear el formulario
      this.resetForm();
      this.mostrarToast('Publicación creada exitosamente');
    } catch (error) {
      console.error('Error al guardar la publicación: ', error);
      this.mostrarToast('Error al crear la publicación');
    }
  }

// Método para reiniciar el formulario
resetForm() {
  this.publicacion = {
    titulolibro: '',
    autor: '',
    genero: '',
    estado: '',
    correoelectronico: '',
    telefono: 0,
    precio: 0,
    descripcion: '',
    anio: 0,
    coordenadas: { lat: 0, lng: 0 },
  };
  this.fotos = []; // Limpiar las fotos seleccionadas
}

  // Método para mostrar el toast
  async mostrarToast(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 2000,
    position: 'bottom',
  });
  toast.present();
}
}
