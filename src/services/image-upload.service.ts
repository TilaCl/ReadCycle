import { Injectable } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes, deleteObject } from '@angular/fire/storage';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor(private storage: Storage) {}

  uploadImage(image: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = from(uploadBytes(storageRef, image));
    return uploadTask.pipe(switchMap(result => getDownloadURL(result.ref)));
  }
  // Función para eliminar la imagen de Firebase Storage
  deleteImage(url: string): Promise<void> {
    // Convertir la URL en una referencia a la ubicación de la imagen
    const storageRef = ref(this.storage, url);
    // Eliminar la imagen utilizando la referencia
    return deleteObject(storageRef).catch(error => {
      console.error('Error al eliminar la imagen:', error);
      throw error; // Lanzar el error para ser manejado en el componente que llama a esta función
    });
  }
}