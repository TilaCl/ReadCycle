import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';  // Solo se importa Auth desde Angular Fire
import { Router } from '@angular/router';
import { GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, getAuth, signInWithPopup, setPersistence, browserLocalPersistence } from "firebase/auth";  // Asegúrate de importar correctamente desde 'firebase/auth'
import { AuthService } from 'src/services/auth.service';
import { UsuarioService } from 'src/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  private auth = inject(Auth);  // Inyectamos el Auth de Angular Fire

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {
    const authInstance = getAuth();
    authInstance.languageCode = 'it';  // Puedes ajustar el idioma
    authInstance.useDeviceLanguage();

    // Configurar la persistencia local al iniciar la app
    this.configureLocalPersistence();
  }

  // Método para configurar la persistencia local
  private async configureLocalPersistence() {
    try {
      // Configuramos la persistencia con `browserLocalPersistence` desde `firebase/auth`
      await setPersistence(this.auth, browserLocalPersistence);  
      console.log('Persistencia local configurada correctamente');
    } catch (error) {
      console.error('Error al configurar la persistencia local:', error);
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await this.handleLogin(provider);
  }

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    await this.handleLogin(provider);
  }

  async loginWithTwitter() {
    const provider = new TwitterAuthProvider();
    await this.handleLogin(provider);
  }

  private async handleLogin(provider: any) {
    try {
      const result = await signInWithPopup(this.auth, provider);
      
      // Obtener los datos del usuario
      const user = {
        id: result.user.uid,              // Usamos el UID de Firebase Auth
        name: result.user.displayName || '', // Asignar cadena vacía si displayName es null
        email: result.user.email || '',   // Asignar cadena vacía si email es null
        photo: result.user.photoURL || '', // Asignar cadena vacía si photoURL es null
      };
  
      // Guardar los datos del usuario en el servicio
      this.authService.setUser(user);
  
      // Verificar si el usuario ya está en Firestore
      const usuarioFirestore = await this.usuarioService.getUsuario(user.id);
      
      if (usuarioFirestore) {
        console.log('Usuario ya existe en Firestore:', usuarioFirestore);
        // Navegar a la página principal después del login exitoso
        this.router.navigate(['/tabs/tab1']);
      } else {
        // Si el usuario no existe, se crea uno nuevo en Firestore
        await this.usuarioService.createUsuario(user.id, user.email, user.photo, user.name, '', '',false); // nickname y celular vacíos
        console.log('Usuario creado en Firestore:', user);
        
        // Navegar a tab5 para que el usuario complete su información
        this.router.navigate(['/tabs/tab5']);
      }
  
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  }
}
