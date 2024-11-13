import { GeocodingService } from './../../services/geocoding.service';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnChanges {
  @Input() lat: number = 0;
  @Input() lng: number = 0;
  zoom: number = 13;
  approxLocation: { lat: number, lng: number } = { lat: 0, lng: 0 };
  circleOptions: google.maps.CircleOptions = {
    strokeColor: '#2a2a2a',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#fbb978',
    fillOpacity: 0.35,
    clickable: false,
    editable: false,
    draggable: false
  };

  constructor(private geocodingService: GeocodingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lat'] || changes['lng']) {
      // Generar ubicación aproximada cuando cambian las coordenadas de entrada
      this.approxLocation = this.generateApproxLocation(this.lat, this.lng);
      console.log('Ubicación aproximada:', this.approxLocation);
      
    }
    
  }

  generateApproxLocation(lat: number, lng: number): { lat: number, lng: number } {
    const offset = 0.01; // Desplazamiento en grados (~1 km)
    const randomOffsetLat = (Math.random() - 0.5) * offset;
    const randomOffsetLng = (Math.random() - 0.5) * offset;

    return {
      lat: lat + randomOffsetLat,
      lng: lng + randomOffsetLng
    };
  }
}