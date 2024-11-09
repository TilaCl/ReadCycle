import { ImageUploadService } from 'src/services/image-upload.service';
import { Component } from '@angular/core';
import { UsuarioService } from 'src/services/usuario.service';
import { PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  selectedOption: string; // Variable para almacenar la opción seleccionada
  isInSale: boolean = false; // Variable para controlar si está en venta
  price: number; // Variable para almacenar el precio
  fotos: File[] = []; // Array para almacenar las fotos seleccionadas
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
  };
  

  constructor(
    private usuarioService: UsuarioService,
    private publicacionService: PublicacionService, 
    private auth: Auth,
    private router: Router, 
    private toastController: ToastController,
    private imageUploadService: ImageUploadService) 
    {
    this.selectedOption = ''; // Inicialmente no hay opción seleccionada
    this.isInSale = false; // Inicialmente, el libro no está en venta
    this.price = 0; // Inicializa el precio a 0
  }


  validateLength(event: any) {
    const input = event.target.value;
    if (input.length > 4) {
      event.target.value = input.slice(0, 4);  // Limita a 4 caracteres
    }
  }

  selectOption(option: string) {
    this.selectedOption = option; // Actualiza la opción seleccionada
  }

  onSaleChange() {
    console.log("Estado de venta:", this.isInSale);
  }

  submitForm() {
    // Manejar la lógica para enviar el formulario
    console.log("Opción seleccionada:", this.selectedOption);
    if (this.selectedOption === 'venta') {
      console.log("Precio:", this.price);
      // Agregar lógica adicional para manejar la venta
    } else if (this.selectedOption === 'intercambio') {
      console.log("Estado de venta:", this.isInSale);
      // Agregar lógica adicional para manejar el intercambio
    }
  }

  goBack() {
    this.selectedOption = ''; // Restablece la opción seleccionada
    this.isInSale = false; // Opcional: Restablece el estado de venta
    this.price = 0; // Opcional: Restablece el precio
  }



  // Evento para manejar la selección de múltiples fotos
  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files.length > 3) {
      this.mostrarToast('Solo puedes seleccionar hasta 3 imágenes');
      return;
    }
    this.fotos = Array.from(files);
  }

  guardarPublicacion() {
    const { titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio } = this.publicacion;
    
    this.publicacionService.crearPublicacion(titulolibro, autor, genero, estado, correoelectronico, telefono, precio, descripcion, anio)
    .then(async (publicacionId) => {
        console.log('Publicación creada con éxito');

        // Subir cada imagen y obtener su URL
        const imagenesUrl = await Promise.all(this.fotos.map((foto, index) => {
          const filePath = `postImg/${this.auth.currentUser?.uid}/${publicacionId}/imagen_${index}`;
            return this.imageUploadService.uploadImage(foto, filePath).toPromise();
        }));

        // Filtrar valores undefined para asegurar que imagenesUrl sea de tipo string[]
        const filteredImagenesUrl = imagenesUrl.filter((url): url is string => url !== undefined);

        // Actualizar la publicación con las URLs de las imágenes en Firestore
        await this.publicacionService.actualizarPublicacion(publicacionId, { imagenesUrl: filteredImagenesUrl });

        this.resetForm(); // Reiniciar formulario después de guardar
        this.goBack();
        this.mostrarToast('Publicación creada exitosamente');
    })
    .catch((error) => {
        console.error('Error al guardar la publicación: ', error);
    });
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
    };
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



