import { AuthService } from 'src/services/auth.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { DetallesPublicacionComponent } from '../detalles-publicacion/detalles-publicacion.component';
import { UsuarioService } from 'src/services/usuario.service';
import { Timestamp } from 'firebase/firestore';  // Importar Timestamp

@Component({
  selector: 'app-inicio',
  templateUrl: 'inicio.page.html',
  styleUrls: ['inicio.page.scss']
})
export class inicioPage implements OnInit {
  user: any;
  publicaciones$!: Observable<Publicacion[]>;
  filteredPublicaciones: Publicacion[] = [];
  searchTerm: string = '';
  publicacionesFavoritas$!: Observable<Publicacion[]>; 
  
  constructor(
    private publicacionService: PublicacionService, 
    private modalController: ModalController,
    private authService: AuthService,
    private usuarioService: UsuarioService) {
    
  }


  ngOnInit() {
    // Si el usuario está logueado, actualizar las publicaciones favoritas
    this.authService.getUser().subscribe(user => {
      this.user = user;
      if (user) {
        // Obtener todas las publicaciones y las favoritas
        this.publicaciones$ = this.publicacionService.obtenerTodasLasPublicaciones();
        this.publicacionesFavoritas$ = this.publicacionService.obtenerFavoritos(); // Aquí ya obtienes las favoritas del usuario
  
        // Suscribirse a las publicaciones y favoritas
        this.publicaciones$.subscribe(publicaciones => {
          this.publicacionesFavoritas$.subscribe(favoritos => {
            // Combina las publicaciones y asigna esFavorito según si está en la lista de favoritos
            publicaciones.forEach(pub => {
              pub.esFavorito = favoritos.some(fav => fav.id === pub.id);
            });
  
            // Ahora que se ha combinado la información, actualiza la lista
            this.filteredPublicaciones = publicaciones;
          });
        });
      }
    });
  }
  
  
  filterPublicaciones() {
    const term = this.searchTerm.toLowerCase();
    this.publicaciones$.subscribe(publicaciones => {
      if (!term) {
        this.filteredPublicaciones = publicaciones;
      } else {
        this.filteredPublicaciones = publicaciones.filter(pub =>
          pub.titulolibro.toLowerCase().includes(term) ||
          pub.autor.toLowerCase().includes(term) ||
          pub.genero.toLowerCase().includes(term) ||
          pub.anio.toString().includes(term)
        );
      }
    });
  }
  

  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
  }

 // Método para abrir el modal con detalles completos de la publicación
 async abrirModal(publicacion: Publicacion) {
  const modal = await this.modalController.create({
    component: DetallesPublicacionComponent, // Componente para mostrar detalles completos
    componentProps: { publicacion } // Pasamos la publicación al modal
  });
  return await modal.present();
}

  // Método para añadir o quitar de favoritos
  onAnadirAFavoritos(publicacion: Publicacion, event: Event) {
    event.stopPropagation();  // Evitar que el clic abra el modal al hacer clic en el corazón

    if (publicacion.esFavorito) {
      // Si la publicación es favorita, quitar de favoritos
      this.publicacionService.quitarDeFavoritos(publicacion.id).then(() => {
        publicacion.esFavorito = false;
      });
    } else {
      // Si no es favorita, añadir a favoritos
      this.publicacionService.anadirAFavoritos(publicacion).then(() => {
        publicacion.esFavorito = true;
      });
    }
  }



  calcularTiempoTranscurrido(fecha: Date | Timestamp | undefined): string {
    if (!fecha) {
      return 'Fecha no disponible'; // Retornar mensaje si la fecha no está definida
    }
  
    const ahora = new Date();
    
    // Si la fecha es un Timestamp de Firestore, convertirla a Date
    const fechaCreacion = fecha instanceof Timestamp ? fecha.toDate() : fecha;
  
    // Asegurarse de que `fechaCreacion` es válida antes de usar `getTime()`
    if (!fechaCreacion) {
      return 'Fecha no disponible';
    }
  
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
