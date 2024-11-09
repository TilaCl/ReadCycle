import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vistapreviaimagen',
  templateUrl: './vistapreviaimagen.component.html',
  styleUrls: ['./vistapreviaimagen.component.scss'],
})
export class VistapreviaimagenComponent {
  @Input() imagenUrl!: string; // Confirma que se asignará antes de usarla
  constructor(private modalController: ModalController) { }
  
  cerrarModal() {
    this.modalController.dismiss();
  }


}
