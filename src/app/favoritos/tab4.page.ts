import { AuthService } from 'src/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Publicacion, PublicacionService } from 'src/services/publicacion.service';
import { ModalController,LoadingController } from '@ionic/angular';
import { DetallesPublicacionComponent } from '../detalles-publicacion/detalles-publicacion.component';
import { UsuarioService } from 'src/services/usuario.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  user: any;
  favoritos$: Observable<Publicacion[]> = new Observable();

  constructor(private publicacionService: PublicacionService,
    private modalController: ModalController,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarData()
  }

async cargarData(){
  const loading = await this.showLoading();
      // Suscríbete al usuario y carga los favoritos
      this.authService.getUser().subscribe(async user => {
        this.user = user;
        if (user) {
          await this.loadUserData(user.id);
          this.loadFavoritos(); // Carga los favoritos después de obtener el usuario
        }
      });
      loading.dismiss();
}
  // Función para añadir o quitar una publicación de favoritos desde el feed
onAnadirAFavoritos(publicacion: Publicacion, event: Event) {
  event.stopPropagation(); // Evita abrir el modal al hacer clic en el botón

  if (publicacion.esFavorito) {
    // Quitar de favoritos
    this.publicacionService.quitarDeFavoritos(publicacion.id).then(() => {
      publicacion.esFavorito = false;
    });
  } else {
    // Añadir a favoritos
    this.publicacionService.anadirAFavoritos(publicacion).then(() => {
      publicacion.esFavorito = true;
    });
  }
}

async showLoading() {
  const loading = await this.loadingController.create({
    message: 'Espere un momento',
    spinner: 'bubbles',
    duration: 5000 // Tiempo máximo en ms, ajusta si es necesario
  });
  await loading.present();
  return loading;
}
  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
  }

// Cargar la lista de favoritos y asignar `esFavorito` en cada publicación
// Cargar favoritos como un Observable
loadFavoritos(): void {
  this.favoritos$ = this.publicacionService.obtenerFavoritos();
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
  // Método para abrir el modal con detalles completos de la publicación
  async abrirModal(publicacion: Publicacion) {
    const modal = await this.modalController.create({
      component: DetallesPublicacionComponent, // Componente para mostrar detalles completos
      componentProps: { publicacion } // Pasamos la publicación al modal
    });
    return await modal.present();
  }

  buscaLibros(){
    this.router.navigate(['/tabs/tab1']);
  }
}