import { Component, Input, OnInit } from '@angular/core';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { ModalController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth'; // Para manejar el usuario autenticado
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';  // Importar Timestamp
import { VistapreviaimagenComponent } from '../vistapreviaimagen/vistapreviaimagen.component';
import { GeocodingService } from 'src/services/geocoding.service';



@Component({
  selector: 'app-detalles-publicacion',
  templateUrl: './detalles-publicacion.component.html',
  styleUrls: ['./detalles-publicacion.component.scss']
})
export class DetallesPublicacionComponent  implements OnInit{
  
  @Input() publicacion!: Publicacion; // Recibir la publicación seleccionada
  comuna: string | null = null; // Atributo para almacenar la comuna

  constructor(private modalController: ModalController, 
    private geocodingService: GeocodingService,
    private publicacionService: PublicacionService, 
    private auth: Auth,
    private router: Router) {}

    ngOnInit() {
      // Llamar a la función para obtener la comuna al cargar el componente
      if (this.publicacion.coordenadas) {
        const { lat, lng } = this.publicacion.coordenadas;
        this.obtenerComuna(lat, lng);
      }
    }
  
    // Función para obtener y asignar la comuna
    obtenerComuna(lat: number, lng: number) {
      this.geocodingService.obtenerComunaDesdeLatLng(lat, lng)
        .then(comuna => {
          this.comuna = comuna; // Asigna la comuna obtenida
          console.log(`Comuna obtenida: ${comuna}`);
        })
        .catch(error => {
          console.error(error);
          this.comuna = 'Error al obtener la comuna';
        });
    }

      // Función para abrir WhatsApp con el número del vendedor
  abrirWhatsApp(telefono: string) {
    const url = `https://wa.me/${telefono}`;
    window.open(url, '_blank');
  }

  // Función para abrir el cliente de correo con el email del vendedor
  enviarCorreo(correo: string) {
    const mailto = `mailto:${correo}`;
    window.open(mailto, '_blank');
  }

    
  async verImagen(imagenUrl: string) {
    const modal = await this.modalController.create({
      component: VistapreviaimagenComponent,
      componentProps: { imagenUrl }
    });
    return await modal.present();
  }


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
