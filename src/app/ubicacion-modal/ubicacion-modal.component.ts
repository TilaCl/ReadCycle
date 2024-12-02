import { ModalController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ubicacion-modal',
  templateUrl: './ubicacion-modal.component.html',
  styleUrls: ['./ubicacion-modal.component.scss'],
})
export class UbicacionModalComponent {
  esAppMovil: boolean;
  mensajeConfiguracion: string;
  imagen1 = 'https://i.ibb.co/6PFPxHg/help1.jpg';
  imagen2 = 'https://i.ibb.co/b1zRcBx/help2.jpg';
  imagen3 = 'https://i.ibb.co/x5BsRDg/help3.jpg';

  constructor(private modalController:ModalController) {
    // Detectar si es una app móvil
    this.esAppMovil = window.navigator.userAgent.includes('Cordova') || window.navigator.userAgent.includes('Capacitor');

    // Detectar el navegador
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      this.mensajeConfiguracion = `1. Abre la configuración de tu navegador.<br>
                                   2. Ve a "Privacidad y seguridad".<br>
                                   3. Haz clic en "Configuración del sitio".<br>
                                   4. Selecciona "Ubicación" y habilítala para esta página.`;
    } else if (userAgent.includes('edg')) {
      this.mensajeConfiguracion = `1. Abre la configuración de Microsoft Edge manualmente.<br>
                                   2. Ve a "Privacidad, búsqueda y servicios".<br>
                                   3. En "Permisos del sitio", selecciona "Ubicación".<br>
                                   4. Habilita el acceso a la ubicación para esta página.`;
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      this.mensajeConfiguracion = `1. Ve a "Configuración" en tu dispositivo Apple.<br>
                                   2. Selecciona "Privacidad y seguridad".<br>
                                   3. Activa los servicios de ubicación para Safari.`;
    } else {
      this.mensajeConfiguracion = `1. Abre la configuración de tu navegador.<br>
                                   2. Ve a la sección de "Privacidad y Seguridad".<br>
                                   3. Ajusta los permisos de ubicación para habilitarla.`;
    }
  }

  cerrarModal(reintentar: boolean) {
    this.modalController.dismiss({ reintentar });
  }
}
