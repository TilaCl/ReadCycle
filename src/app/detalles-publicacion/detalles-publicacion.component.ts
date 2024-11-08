import { Component, Input } from '@angular/core';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { ModalController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalles-publicacion',
  templateUrl: './detalles-publicacion.component.html',
  styleUrls: ['./detalles-publicacion.component.scss']
})
export class DetallesPublicacionComponent {
  @Input() publicacion!: Publicacion; // Recibir la publicación seleccionada

  constructor(private modalController: ModalController, private publicacionService: PublicacionService, private auth: Auth,
    private router: Router) {}

  cerrarModal() {
    this.modalController.dismiss();
  }
}
