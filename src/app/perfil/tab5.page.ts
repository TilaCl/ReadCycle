import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UsuarioService, Usuario } from 'src/services/usuario.service';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  user: any;
  nickname: string = '';
  celular: string = '';

  constructor(private router: Router, private authService: AuthService, private usuarioService: UsuarioService) {}

  ngOnInit() {
    // Suscribirse a los datos del usuario desde el servicio
    this.authService.getUser().subscribe(async user => {
      this.user = user;

      if (user) {
        await this.loadUserData(user.id); // Cargar datos existentes
      }
    });
  }

  async loadUserData(userId: string) {
    const usuario = await this.usuarioService.getUsuario(userId);
    if (usuario) {
      this.nickname = usuario.nickname; // Cargar nickname
      this.celular = usuario.celular;  // Cargar número de teléfono
    }
  }

  async updateUser() {
    if (this.user) {
      await this.usuarioService.updateUsuario(this.user.id, {
        nickname: this.nickname, // Actualiza el nickname
        celular: this.celular,  // Actualiza el número de teléfono
      });
      console.log('Información actualizada con éxito');
      // Mostrar mensaje de éxito aquí si lo deseas
    }
  }

  logout() {
    this.authService.logout().then(() => {
      // Redirigir al login después de cerrar sesión
      this.router.navigate(['/login']);
    });
  }
}
