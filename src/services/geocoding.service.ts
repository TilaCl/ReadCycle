import { Injectable, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  lat: number = 0;
  lng: number = 0;
  errorMessage: string = '';

  constructor(private toastController: ToastController) {}

  // Método para obtener la ubicación del usuario
  obtenerUbicacion(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('Ubicación obtenida: ', lat, lng);
            resolve({ lat, lng });
          },
          (error) => {
            if (error.code === 1) {
              reject(new Error('User denied Geolocation'));
            } else {
              reject(new Error('No se pudo obtener la ubicación'));
            }
          }
        );
      } else {
        reject(new Error('La geolocalización no está soportada en este navegador'));
      }
    });
  }
  
  obtenerComunaDesdeLatLng(lat: number, lng: number): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(lat, lng);
  
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) { // Verificación adicional
          // Buscar la comuna en los componentes de la dirección
          const addressComponents = results[0].address_components;
          const comuna = addressComponents.find(component =>
            component.types.includes('locality')
          );
  
          if (comuna) {
            resolve(comuna.long_name); // Retorna el nombre de la comuna
          } else {
            resolve(null); // Comuna no encontrada
          }
        } else {
          reject('No se pudo obtener la comuna');
        }
      });
    });
  }
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
    });
    toast.present();
  }
}