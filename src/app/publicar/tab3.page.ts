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
  LoadingController,
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
  minYear = '0';
  imagePreviewUrls: string[] = [];
  selectedFiles: File[] = [];

  publicacion = {
    titulolibro: '',
    autor: '',
    genero: '',
    estado: '',
    correoelectronico: '',
    telefono: '',
    precio: null as number | null, // Solo números, inicializado como null
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
    private modalController: ModalController,
    private loadingController: LoadingController
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
      this.correo = usuario.correo || '';
      this.celular = usuario.celular || '+56';
  
      // Disparar la validación inicial
      setTimeout(() => {
        this.publicacion.correoelectronico = this.correo;
        this.publicacion.telefono = this.celular;
      });
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
    const fullDate = event.detail.value;
    this.publicacion.anio = parseInt(fullDate.split('-')[0], 10);
  }

  validateLength(event: any) {
    const input = event.target.value;
    if (input.length > 4) {
      event.target.value = input.slice(0, 4); // Limita a 4 caracteres
    }
  }

  onPrecioChange(event: any) {
    const inputValue = event.target.value;
    if (!/^\d*$/.test(inputValue)) {
      event.target.value = inputValue.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    }
    this.publicacion.precio = parseInt(event.target.value, 10) || null; // Evitar que sea 0 al inicio
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
  
    if (files) {
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
  
      // Restablecer el valor del input después de procesar los archivos
      event.target.value = '';
    }
  }

  removeImage(index: number) {
    this.imagePreviewUrls.splice(index, 1); // Eliminar la vista previa de la imagen
    this.selectedFiles.splice(index, 1);   // Eliminar el archivo seleccionado
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
  
    const loading = await this.showLoading();
    
    try {
      // Validación inicial de datos requeridos
      if (!titulolibro || !autor || !genero || !estado || !correoelectronico || !telefono || !precio || !descripcion || !anio) {
        loading.dismiss();
        this.mostrarToast('Por favor, completa todos los campos requeridos.');
        loading.dismiss();
        return;
      }
  
      if (this.selectedFiles.length === 0) {
        loading.dismiss();
        this.mostrarToast('Debes seleccionar al menos una imagen.');
        return;
      }
  
      // Intentar obtener coordenadas del usuario
      let coordenadas = null;
      try {
        coordenadas = await this.geocodingService.obtenerUbicacion();
        
      } catch (error) {
        console.warn('No se pudo obtener la ubicación automática, solicitando manualmente.');
        const reintentar = await this.mostrarModalUbicacion();
        loading.dismiss();
        if (!reintentar) {
          loading.dismiss();
          return;
        }
      }
  
      // Crear la publicación en Firestore
      const publicacionId = await this.publicacionService.crearPublicacion(
        titulolibro,
        autor,
        genero,
        estado,
        correoelectronico,
        telefono,
        precio!,
        descripcion,
        anio,
        esFavorito,
        coordenadas || { lat: 0, lng: 0 } // Coordenadas predeterminadas si falló
      );
  
      // Subir imágenes y guardar URLs
      const imagenesUrl = (await Promise.all(
        this.selectedFiles.map(async (file, index) => {
          try {
            const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
            return await this.imageUploadService.uploadImage(file, filePath).toPromise();
          } catch (error) {
            console.error(`Error al subir la imagen ${index}:`, error);
            loading.dismiss();
            return null; // Evitar errores por imágenes fallidas
          }
        })
      )).filter((url): url is string => url !== null);
  
      if (imagenesUrl.length === 0) {
        throw new Error('Error al subir las imágenes. Inténtalo nuevamente.');
        loading.dismiss();
      }
  
      // Actualizar publicación con las URLs de las imágenes
      await this.publicacionService.actualizarPublicacion(publicacionId, { imagenesUrl });
  
      // Limpiar el formulario y mostrar éxito
      this.resetForm();
      loading.dismiss();
      this.mostrarToast('Publicación creada exitosamente');
      this.router.navigate(['/tabs/tab2']);
    } catch (error) {
      
      console.error('Error al guardar la publicación: ', error);
      loading.dismiss();
      this.mostrarToast('Error al crear la publicación. Inténtalo nuevamente.');
    }
  }
  

  resetForm() {
    this.publicacion = {
      titulolibro: '',
      autor: '',
      genero: '',
      estado: '',
      correoelectronico: '',
      telefono: '',
      precio: null,
      descripcion: '',
      anio: 0,
      esFavorito: false,
      coordenadas: { lat: 0, lng: 0 },
    };
    this.selectedFiles = [];
    this.imagePreviewUrls = [];
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1000,
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
  
  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento',
      spinner: 'crescent',
      duration: 2000,
    });
    await loading.present();
    return loading;
  }
}
