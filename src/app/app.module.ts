import { UbicacionModalComponent } from './ubicacion-modal/ubicacion-modal.component';

import { environment } from './../environments/environment';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { VistapreviaimagenComponent } from './vistapreviaimagen/vistapreviaimagen.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { MapaComponent } from './mapa/mapa.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { RefreshComponent } from './refresh/refresh.component';
import { provideHttpClient } from '@angular/common/http'; // <-- Importa provideHttpClient
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';

@NgModule({
  declarations: [
    AppComponent,
    DetallesPublicacionComponent,
    EditarPublicacionComponent,
    VistapreviaimagenComponent,
    MapaComponent,
    UbicacionModalComponent,
    RefreshComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    GoogleMapsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideHttpClient(),
    Diagnostic,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
