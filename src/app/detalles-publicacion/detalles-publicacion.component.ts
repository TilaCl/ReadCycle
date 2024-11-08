import { Component, Input } from '@angular/core';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { ModalController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';  // Importar Timestamp

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

  calcularTiempoTranscurrido(fecha: Date | Timestamp): string {
    const ahora = new Date();
    
    // Si la fecha es un Timestamp de Firestore, convertirla a Date
    const fechaCreacion = fecha instanceof Timestamp ? fecha.toDate() : fecha;
  
    const diferencia = ahora.getTime() - fechaCreacion.getTime(); // Diferencia en milisegundos
  
    const segundos = Math.floor(diferencia / 1000); // convertir a segundos
    const minutos = Math.floor(segundos / 60); // convertir a minutos
    const horas = Math.floor(minutos / 60); // convertir a horas
    const dias = Math.floor(horas / 24); // convertir a días
    const semanas = Math.floor(dias / 7); // convertir a semanas
    const meses = Math.floor(dias / 30); // convertir a meses
    const años = Math.floor(dias / 365); // convertir a años
  
    if (años > 0) {
      return `${años} año${años > 1 ? 's' : ''}`;
    } else if (meses > 0) {
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    } else if (semanas > 0) {
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else if (dias > 0) {
      return `${dias} día${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return `${segundos} segundo${segundos > 1 ? 's' : ''}`;
    }
  }
}
