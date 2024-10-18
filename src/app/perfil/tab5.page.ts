import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UsuarioService } from 'src/services/usuario.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  user: any;
  nickname: string = '';
  celular: string = '';

  public actionSheetButtons = [
    {
      text: 'Donar $10.000 pesos',
      role: 'destructive',
      data: { action: 'delete' },
      handler: () => {
        console.log('Donación de $10.000 realizada');
      }
    },
    {
      text: 'Donar $1.000 pesos',
      data: { action: 'share' },
      handler: () => {
        console.log('Donación de $1.000 realizada');
      }
    },
    {
      text: 'Salir',
      role: 'cancel',
      data: { action: 'cancel' },
      handler: () => {
        console.log('Donación cancelada');
      },
    },
  ];

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    public actionSheetCtrl: ActionSheetController,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit() {
    this.authService.getUser().subscribe(async user => {
      this.user = user;
      if (user) {
        await this.loadUserData(user.id);
      }
    });
  }

  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
    if (usuario) {
      this.nickname = usuario.nickname;
      this.celular = usuario.celular;
      this.user.photo = usuario.fotourl; // Carga la foto de perfil si existe
    }
  }

  uploadProfileImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `profile_images/${this.user.id}`;

      this.imageUploadService.uploadImage(file, filePath).subscribe(
        (url: string) => {
          this.user.photo = url; // Actualiza la foto en el objeto del usuario
          this.usuarioService.updateUsuario(this.user.id, { fotourl: url }).then(() => {
            console.log('Foto de perfil actualizada');
          }).catch(error => {
            console.error('Error al actualizar la URL en Firestore: ', error);
          });
        },
        error => {
          console.error('Error al subir la imagen: ', error);
        }
      );
    }
  }

  async updateUser() {
    if (this.user) {
      await this.usuarioService.updateUsuario(this.user.id, {
        nickname: this.nickname,
        celular: this.celular,
      });
      console.log('Información actualizada con éxito');
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
