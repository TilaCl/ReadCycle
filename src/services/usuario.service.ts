import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { docData, collectionData } from '@angular/fire/firestore';
import { signOut, Auth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';

export interface Usuario {
  id: string;  // Cambiamos a id: string para utilizar el UID de Firebase Auth
  correo: string;
  fotourl: string;
  nombre: string;
  nickname: string;
  celular: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.firebase}/publicaciones`; // Endpoint para obtener publicaciones
  
  constructor(private firestore: Firestore) {}

  // Crear un nuevo usuario
  async createUsuario(id: string, correo: string, fotourl: string, nombre: string, nickname: string, celular: string): Promise<void> {
    const usuarioRef = doc(this.firestore, `Usuarios/${id}`);

    const usuario: Usuario = {
      id,
      correo,
      fotourl,
      nombre,
      nickname,
      celular
    };

    await setDoc(usuarioRef, usuario);
    console.log('Usuario creado con éxito');
  }

  // Obtener un usuario por ID
  async getUsuario(id: string): Promise<Usuario | undefined> {
    const usuarioRef = doc(this.firestore, `Usuarios/${id}`);
    const usuarioSnap = await getDoc(usuarioRef);
    return usuarioSnap.exists() ? usuarioSnap.data() as Usuario : undefined;
  }

  // Actualizar los datos de un usuario existente
  async updateUsuario(id: string, data: Partial<Usuario>): Promise<void> {
    const usuarioRef = doc(this.firestore, `Usuarios/${id}`);
    await updateDoc(usuarioRef, data);
    console.log('Usuario actualizado con éxito');
  }


}


