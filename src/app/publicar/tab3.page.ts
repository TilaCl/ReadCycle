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
      this.correo = usuario.correo || ''; // Inicializa solo si existe
      this.celular = usuario.celular || '+56'; // Default si no existe
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
      esFavorito,
    } = this.publicacion;

    const loading = await this.showLoading();
    try {
      if (this.selectedFiles.length === 0) {
        loading.dismiss();
        this.mostrarToast('Debe seleccionar al menos una imagen');
        return;
      }

      let coordenadas = await this.geocodingService.obtenerUbicacion();
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
        coordenadas
      );

      const imagenesUrl = (
        await Promise.all(
          this.selectedFiles.map(async (file, index) => {
            const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
            return await this.imageUploadService.uploadImage(file, filePath).toPromise();
          })
        )
      ).filter((url: string | null | undefined): url is string => !!url);

      await this.publicacionService.actualizarPublicacion(publicacionId, { imagenesUrl });

      this.resetForm();
      loading.dismiss();
      this.mostrarToast('Publicación creada exitosamente');
      this.router.navigate(['/tabs/tab2']);
    } catch (error) {
      loading.dismiss();
      this.mostrarToast('Error al crear la publicación');
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
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento',
      spinner: 'crescent',
    });
    await loading.present();
    return loading;
  }
}
