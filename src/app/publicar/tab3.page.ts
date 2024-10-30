import { Component } from '@angular/core';
import { UsuarioService } from 'src/services/usuario.service';
import { PublicacionService } from 'src/services/publicacion.service';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importar ToastController

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  selectedOption: string; // Variable para almacenar la opción seleccionada
  isInSale: boolean = false; // Variable para controlar si está en venta
  price: number; // Variable para almacenar el precio
  publicacion = {
    titulolibro: '',
    autor: '',
    genero: '',
    estado: '',
    correoelectronico: '',
    telefono: 0,
    descripcion: '',
    precio: 0,
    anio: 0,
  };
  

  constructor(private usuarioService: UsuarioService, private publicacionService: PublicacionService, private auth: Auth,
    private router: Router, private toastController: ToastController) {
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
  // Método para guardar la publicación
  guardarPublicacion() {
    const { titulolibro, autor, genero, estado, correoelectronico, telefono, descripcion, precio, anio } = this.publicacion;
    
    this.publicacionService.crearPublicacion(
      titulolibro,
      autor,
      genero,
      estado,
      correoelectronico,
      telefono,
      descripcion,
      precio,
      anio,
    )
    .then(() => {
      console.log('Publicación guardada con éxito');
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
      descripcion: '',
      precio: 0,
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



