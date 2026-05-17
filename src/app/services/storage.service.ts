import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  async uploadImage(file: File, path: string = 'product-images'): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, `${path}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async deleteImage(url: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }
  }
}
