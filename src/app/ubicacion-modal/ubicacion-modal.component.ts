import { ModalController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ubicacion-modal',
  templateUrl: './ubicacion-modal.component.html',
  styleUrls: ['./ubicacion-modal.component.scss'],
})
export class UbicacionModalComponent {
  esAppMovil: boolean;
  pasos: string[] = [];
  imagenes: string[] = [];

  constructor(private modalController: ModalController) {
    // Detectar si es una app móvil
    this.esAppMovil = window.navigator.userAgent.includes('Cordova') || window.navigator.userAgent.includes('Capacitor');

    // Detectar el navegador
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      this.pasos = [
        'Ve a "Permisos" .',
        'Selecciona "Ubicación" y habilítala para esta página.',

      ];
    } else if (userAgent.includes('edg')) {
      this.pasos = [
        'Abre la configuración de tu navegador, puede ser desde el candado o el icono de ajustes junto al URL.',
        'Ve a "Permisos" .',
        'Selecciona "Ubicación" y habilítala para esta página.',

      ];
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      this.pasos = [
        'Ve a "Configuración" en tu dispositivo Apple.',
        'Selecciona "Privacidad y seguridad".',
        'Activa los servicios de ubicación para Safari.',
      ];
    } else {
      this.pasos = [
        'Abre la configuración de tu navegador.',
        'Ve a la sección de "Privacidad y Seguridad".',
        'Ajusta los permisos de ubicación para habilitarla.',
      ];
    }

    // Imágenes para todos los navegadores
    this.imagenes = [
      'https://i.ibb.co/6PFPxHg/help1.jpg',
      'https://i.ibb.co/b1zRcBx/help2.jpg',
      'https://i.ibb.co/x5BsRDg/help3.jpg',
    ];
  }

  cerrarModal(reintentar: boolean) {
    this.modalController.dismiss({ reintentar });
  }
}
