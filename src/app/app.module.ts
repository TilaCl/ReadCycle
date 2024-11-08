import { environment } from './../environments/environment';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { getStorage, provideStorage } from '@angular/fire/storage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { DetallesPublicacionComponent } from './detalles-publicacion/detalles-publicacion.component';
import { EditarPublicacionComponent } from './editar-publicacion/editar-publicacion.component';
import { FormsModule } from '@angular/forms';  // Importa FormsModule



@NgModule({
  declarations: [AppComponent, DetallesPublicacionComponent,
    EditarPublicacionComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: 
  [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    provideFirebaseApp(() => initializeApp(environment.firebase)), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideStorage(()=> getStorage())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
