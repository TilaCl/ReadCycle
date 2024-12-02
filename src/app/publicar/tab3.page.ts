import { AuthService } from 'src/services/auth.service';
import { GeocodingService } from './../../services/geocoding.service';
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/services/usuario.service';
import { PublicacionService } from 'src/services/publicacion.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Platform } from '@ionic/angular';
import { UbicacionModalComponent } from '../ubicacion-modal/ubicacion-modal.component';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  autores: string[] = [];
  generos: string[] = [];
  autoresFiltrados: string[] = [];
  generosFiltrados: string[] = [];
  mostrarSugerenciasGenero = false;
  mostrarSugerenciasAutor = false;
  correo: string = '';
  celular: string = '+56';
  user: any;
  maxYear = new Date().getFullYear().toString();
  minYear = '1900';
  imagePreviewUrls: string[] = [];
  selectedFiles: File[] = [];

  publicacion = {
    titulolibro: '',
    autor: '',
    genero: '',
    estado: '',
    correoelectronico: '',
    telefono: '',
    precio: 0,
    descripcion: '',
    anio: 0,
    esFavorito: false,
    coordenadas: { lat: 0, lng: 0 },
  };
  fotos: File[] = []; // Array para almacenar las fotos seleccionadas

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private geocodingService: GeocodingService,
    private publicacionService: PublicacionService,
    private auth: Auth,
    private router: Router,
    private toastController: ToastController,
    private imageUploadService: ImageUploadService,
    private http: HttpClient,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.user = user;
      if (user) {
        await this.loadUserData(user.id);
      }
    });
    this.cargarAutores();
    this.cargarGeneros();
  }
  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
    if (usuario) {
      this.correo = usuario.correo;
      this.celular = usuario.celular;
    }
  }
  cargarAutores() {
    this.http.get<string[]>('/assets/autor.json').subscribe((data) => {
      this.autores = data;
    });
  }

  cargarGeneros() {
    this.http.get<string[]>('/assets/genero.json').subscribe((data) => {
      this.generos = data;
    });
  }

  filtrarGeneros(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.generosFiltrados = this.generos.filter((genero) =>
        genero.toLowerCase().includes(valor)
      );
      this.mostrarSugerenciasGenero = this.generosFiltrados.length > 0;
    } else {
      this.mostrarSugerenciasGenero = false;
    }
  }

  filtrarAutores(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.autoresFiltrados = this.autores.filter((autor) =>
        autor.toLowerCase().includes(valor)
      );
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
      event.target.value = input.slice(0, 4); // Limita a 4 caracteres
    }
  }

  // Evento para manejar la selección de imágenes
  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      // Limit to 5 images
      const remainingSlots = 3 - this.imagePreviewUrls.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots) as File[];

      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
          this.selectedFiles.push(file);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.imagePreviewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }
 

  async guardarPublicacion() {
    const { 
      titulolibro, 
      autor, 
      genero, 
      estado, 
      correoelectronico, 
      telefono, 
      precio, 
      descripcion, 
      anio, 
      esFavorito 
    } = this.publicacion;
  
    try {
      if (this.selectedFiles.length === 0) {
        this.mostrarToast('Debe seleccionar al menos una imagen');
        return;
      }
  
      let coordenadas = null;
      let reintentar = true;
      let intentos = 0;
      const maxIntentos = 3;
  
      while (!coordenadas && reintentar && intentos < maxIntentos) {
        try {
          intentos++;
          coordenadas = await this.geocodingService.obtenerUbicacion();
          if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
            throw new Error('Coordenadas inválidas');
          }
        } catch (error: any) {
          if (error.message.includes('denied') || error.code === 1) {
            console.warn('Permiso de geolocalización denegado');
            reintentar = await this.mostrarModalUbicacion();
          } else {
            console.error('Error al obtener ubicación:', error);
            throw new Error('No se pudo obtener la ubicación.');
          }
        }
      }
  
      if (!coordenadas) {
        console.warn('Publicación cancelada debido a falta de permisos o demasiados intentos fallidos.');
        return;
      }
  
      const publicacionId = await this.publicacionService.crearPublicacion(
        titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio, esFavorito, coordenadas
      );
      console.log('Publicación creada con éxito');
  
      // Resolver el Promise antes de usar filter
      const imagenesUrl = (await Promise.all(
        this.selectedFiles.map(async (file, index) => {
          try {
            const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
            return await this.imageUploadService.uploadImage(file, filePath).toPromise();
          } catch (error) {
            console.error(`Error al subir la imagen ${index}:`, error);
            return null; // Manejar errores individuales de subida
          }
        })
      )).filter((url: string | null | undefined): url is string => url !== null && url !== undefined);
  
      await this.publicacionService.actualizarPublicacion(publicacionId, { imagenesUrl });
  
      this.resetForm();
      this.mostrarToast('Publicación creada exitosamente');
  
      // Redirigir a la página de publicaciones del usuario
      this.router.navigate(['/tab2']);
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
      telefono: '',
      precio: 0,
      descripcion: '',
      anio: 0,
      esFavorito: false,
      coordenadas: { lat: 0, lng: 0 },
    };
    // Limpiar las imágenes seleccionadas y las previsualizaciones
    this.selectedFiles = [];
    this.imagePreviewUrls = [];
  }
  // Método para mostrar el toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  async mostrarModalUbicacion(): Promise<boolean> {
    const modal = await this.modalController.create({
      component: UbicacionModalComponent,
    });
    await modal.present();
  
    // Manejo del resultado del modal
    const { data } = await modal.onDidDismiss();
    return data ? data.reintentar : false;
  }
  
  
  
  
}
