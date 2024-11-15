import { AuthService } from 'src/services/auth.service';
import { GeocodingService } from './../../services/geocoding.service';
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/services/usuario.service';
import { PublicacionService } from 'src/services/publicacion.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
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
    coordenadas: { lat: 0, lng: 0 }
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
  ) { }

  ngOnInit() {
    this.authService.getUser().subscribe(async user => {
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

  // Evento para manejar la selección de imágenes
  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      // Limit to 5 images
      const remainingSlots = 3 - this.imagePreviewUrls.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots) as File[];

      filesToAdd.forEach(file => {
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
      // Verificar que haya al menos una imagen seleccionada
      if (this.selectedFiles.length === 0) {
        this.mostrarToast('Debe seleccionar al menos una imagen');
        return;
      }
  
      // Obtener las coordenadas usando geocodingService
      const coordenadas = await this.geocodingService.obtenerUbicacion();
      
      if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
        throw new Error('No se pudo obtener la ubicación.');
      }
  
      // Crear la publicación con coordenadas
      const publicacionId = await this.publicacionService.crearPublicacion(
        titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio, esFavorito, coordenadas
      );
      console.log('Publicación creada con éxito');
  
      // Subir las imágenes seleccionadas y obtener sus URLs
      const imagenesUrl = await Promise.all(this.selectedFiles.map((file, index) => {
        const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
        return this.imageUploadService.uploadImage(file, filePath).toPromise();
      }));
  
      // Filtrar valores undefined
      const filteredImagenesUrl = imagenesUrl.filter((url): url is string => url !== undefined);
  
      // Actualizar la publicación con las URLs de las imágenes
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
    position: 'bottom',
  });
  toast.present();
}
}
