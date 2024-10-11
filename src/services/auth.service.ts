import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject para almacenar la información del usuario
  private userData = new BehaviorSubject<any>(null);
  private auth = inject(Auth);  // Inyectamos la instancia de Firebase Auth
  isLoggingOut = false;

  constructor() {
    this.checkAuthState();
  }

  // Método para establecer los datos del usuario
  setUser(user: any) {
    this.userData.next(user);
  }

  // Método para obtener los datos del usuario
  getUser() {
    return this.userData.asObservable();
  }

  // Verificar el estado de autenticación y actualizar los datos del usuario
  private checkAuthState() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('Usuario autenticado:', user);
        const userData = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photo: user.photoURL || ''
        };
        this.setUser(userData);
      } else {
        console.log('No hay usuario autenticado');
        this.setUser(null);  // Limpiar los datos si no hay usuario
      }
    });
  }

  // Método para cerrar sesión
  logout() {
    this.isLoggingOut = true;  // Indicar que estamos en proceso de logout

    return signOut(this.auth)
      .then(() => {
        console.log('Sesión cerrada exitosamente');
        this.setUser(null);

        // Limpiar la persistencia local
        localStorage.clear();
        sessionStorage.clear();

        // Pequeña espera antes de redirigir y reiniciar el estado
        setTimeout(() => {
          this.isLoggingOut = false;  // Logout completado, reiniciamos el estado
          console.log('Navegando a login después de logout');
        }, 1000);  // 1 segundo para evitar cualquier redirección accidental
      })
      .catch((error) => {
        this.isLoggingOut = false;  // Reiniciar estado si hubo error
        console.error('Error al cerrar sesión:', error);
      });
  }
}
