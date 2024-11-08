import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { docData, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'; // Importar Firebase Storage
import { Timestamp } from 'firebase/firestore';  // Importar Timestamp

export interface Publicacion {
  id: string;
  titulolibro: string;
  autor: string;
  genero: string,
  estado: string;
  correoelectronico: string;
  telefono: number;
  precio: number;
  descripcion: string;
  anio: number;
  fechaCreacion: Timestamp; // Nueva propiedad para la fecha de creación
  
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  constructor(private firestore: Firestore, private auth: Auth, private storage: Storage) {}

  // Crear una nueva publicación para un usuario
  async crearPublicacion(titulolibro: string, autor: string, genero: string, estado: string, correoelectronico: string, telefono: number, precio: number, descripcion: string, anio: number): Promise<void> {
    const userId = this.auth.currentUser?.uid; // Obtener el ID del usuario autenticado
    if (userId) {
      const publicacionId = doc(collection(this.firestore, `Usuarios/${userId}/publicaciones`)).id; // Crear ID para la publicación
      const fechaCreacion = Timestamp.fromDate(new Date());// Convertir Date a Timestamp
      const publicacion: Publicacion = {
        id: publicacionId,
        titulolibro,
        autor,
        genero,
        estado,
        correoelectronico,
        telefono,
        precio,
        descripcion,
        anio,
        fechaCreacion,
      };

      // Guardar la publicación en la subcolección "publicaciones" del usuario
      await setDoc(doc(this.firestore, `Usuarios/${userId}/publicaciones/${publicacionId}`), publicacion);
      console.log('Publicación creada con éxito');
    } else {
      console.error('Usuario no autenticado');
    }
  }


  // Obtener todas las publicaciones de un usuario
  obtenerPublicacionesDeUsuario(userId: string): Observable<Publicacion[]> {
    const publicacionesRef = collection(this.firestore, `Usuarios/${userId}/publicaciones`);
    return collectionData(publicacionesRef, { idField: 'id' }) as Observable<Publicacion[]>;
  }

// Actualizar una publicación
async actualizarPublicacion(publicacionId: string, data: Partial<Publicacion>): Promise<void> {
  const userId = this.auth.currentUser?.uid;
  if (userId) {
    const publicacionRef = doc(this.firestore, `Usuarios/${userId}/publicaciones/${publicacionId}`);
    await updateDoc(publicacionRef, data);
    console.log('Publicación actualizada con éxito');
  } else {
    console.error('Usuario no autenticado');
  }
}

// Eliminar una publicación
async eliminarPublicacion(userId: string, publicacionId: string): Promise<void> {
  // Verifica si los parámetros son válidos
  if (!userId || !publicacionId) {
    console.error('El ID del usuario o la publicación no es válido');
    return;
  }

  console.log(`Intentando eliminar publicación con ID: ${publicacionId} para el usuario ${userId}`);

  // Crear referencia al documento de la publicación en Firestore
  const publicacionRef = doc(this.firestore, `Usuarios/${userId}/publicaciones/${publicacionId}`);

  // Obtener el documento para verificar que exista
  const docSnap = await getDoc(publicacionRef);

  // Si el documento no existe, loguear un error y salir de la función
  if (!docSnap.exists()) {
    console.error('No se encontró la publicación a eliminar');
    return;
  }

  // Si el documento existe, proceder a eliminarlo
  try {
    await deleteDoc(publicacionRef);
    console.log('Publicación eliminada con éxito');
  } catch (error) {
    console.error('Error al eliminar la publicación:', error);
  }
}

}

