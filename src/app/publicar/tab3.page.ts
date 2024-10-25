import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  selectedOption: string; // Variable para almacenar la opción seleccionada
  isInSale: boolean = false; // Variable para controlar si está en venta
  price: number; // Variable para almacenar el precio
  

  constructor() {
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

  

}


