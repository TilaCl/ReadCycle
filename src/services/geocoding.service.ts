import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  lat: number = 0;
  lng: number = 0;
  errorMessage: string = '';

  constructor() {}

  // Método para obtener la ubicación del usuario
  obtenerUbicacion(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('Ubicación obtenida: ', lat, lng);
            resolve({ lat, lng });  // Resuelve la promesa con las coordenadas
          },
          (error) => {
            this.errorMessage = 'No se pudo obtener la ubicación';
            console.error(error);
            reject(this.errorMessage);  // Rechaza la promesa si hay error
          }
        );
      } else {
        this.errorMessage = 'La geolocalización no está soportada en este navegador';
        console.error(this.errorMessage);
        reject(this.errorMessage);  // Rechaza la promesa si geolocalización no es soportada
      }
    });
  }
}