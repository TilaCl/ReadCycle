import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UsuarioService } from 'src/services/usuario.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import {  ToastController, LoadingController } from '@ionic/angular';

declare const paypal: any;

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  user: any;
  nickname: string = '';
  celular: string = '+56';
  isEditCardVisible = false; // Controla la visibilidad del card para editar perfil



  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private imageUploadService: ImageUploadService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(async (user) => {
      this.user = user;
      if (user) {
        await this.loadUserData(user.id); // Carga la información del usuario
      }
  
      // Inicializar los botones de PayPal después de cargar los datos del usuario
      if (this.user) {
        this.initPayPalButtons();
      }
    });
  }

  async loadUserData(userId: string) {
    const loading = await this.showLoading();
    const usuario = await this.usuarioService.getUsuario(userId);
    if (usuario) {
      this.nickname = usuario.nickname;
      this.celular = usuario.celular;
      this.user.photo = usuario.fotourl; // Carga la foto de perfil si existe
      loading.dismiss();
    }
  }

  uploadProfileImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `profile_images/${this.user.id}`; // Misma ruta para sobreescribir la imagen
  
      this.imageUploadService.uploadImage(file, filePath).subscribe(
        (url: string) => {
          this.user.photo = url; // Actualiza la foto en el objeto del usuario
          this.usuarioService.updateUsuario(this.user.id, { fotourl: url }).then(() => {
            console.log('Foto de perfil actualizada');
            this.mostrarToast('Foto cambiada con exito')
          }).catch(error => {
            console.error('Error al actualizar la URL en Firestore: ', error);
          });
        },
        error => {
          console.error('Error al subir la imagen: ', error);
          this.mostrarToast('Error al subir la foto, intentelo mas tarde')
        }
      );
    }
  }

  // Método para mostrar el card desplegable
  toggleEditCard() {
    this.isEditCardVisible = !this.isEditCardVisible;
  }

  // Método para guardar cambios de usuario
  async updateUser() {
    if (this.user) {
      await this.usuarioService.updateUsuario(this.user.id, {
        nickname: this.nickname,
        celular: this.celular,
      });
      console.log('Información actualizada con éxito');
      this.mostrarToast('Información actualizada correctamente');
      this.toggleEditCard(); // Cierra el card después de guardar cambios
    }
  }

  // Método para mostrar el toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000, // Duración de 2 segundos
      position: 'bottom',
    });
    toast.present();
  }

// Función para formatear el número de teléfono y asegurar el prefijo "+56"
formatPhoneNumber(event: any) {
  let input = event.detail.value;

  // Aseguramos que el prefijo "+56" esté al inicio y que solo haya números
  if (!input.startsWith('+56')) {
    input = '+56' + input.replace(/[^0-9]/g, ''); // Solo números
  } else {
    input = '+56' + input.slice(3).replace(/[^0-9]/g, ''); // Solo números después de "+56"
  }




  this.celular = input; // Actualizamos el valor del campo
}

// Verifica si el número de teléfono tiene el formato correcto
isPhoneNumberValid(): boolean {
  const phoneRegex = /^\+569\d{4}\d{4}$/;
  return phoneRegex.test(this.celular);
}

// Verifica si el formulario es válido
isFormValid(): boolean {
  return this.nickname.trim() !== '' && this.isPhoneNumberValid();
}


  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento',
      spinner: 'crescent',
      duration: 5000 // Tiempo máximo en ms, ajusta si es necesario
    });
    await loading.present();
    return loading;
  }
  initPayPalButtons(): void {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: '1.00', // Monto para $1 USD
              },
            },
          ],
        });
      },
      onApprove: async (data: any, actions: any) => {
        const order = await actions.order.capture();
        console.log('Pago completado: ', order);

        // Actualizar el estado de haDonado en Firebase
        this.usuarioService.updateUsuario(this.user.id, { haDonado: true })
          .then(() => {
            this.user.haDonado = true;
            this.mostrarToast('Gracias por tu donación de $1 USD 🙌');
          })
          .catch(error => {
            console.error('Error actualizando Firestore:', error);
            this.mostrarToast('Error al registrar la donación.');
          });
      },
      onError: (err: any) => {
        console.error('Error en PayPal:', err);
        this.mostrarToast('Error en el proceso de pago. Intenta nuevamente.');
      },
    }).render('#paypal-button-container-1'); // Contenedor para el botón de $1 USD
  }
  resetearDonationStatus(): void {
    if (this.user) {
      this.usuarioService.updateUsuario(this.user.id, { haDonado: false })
        .then(() => {
          this.user.haDonado = false; // Actualiza el estado localmente
          this.mostrarToast('El estado de la donación ha sido reseteado.');
        })
        .catch(error => {
          console.error('Error al resetear el estado de donación:', error);
          this.mostrarToast('Error al intentar resetear el estado. Inténtalo nuevamente.');
        });
    } else {
      this.mostrarToast('No se pudo resetear el estado porque no se encontró un usuario.');
    }
  }
}
