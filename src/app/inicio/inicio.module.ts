import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inicioPage } from './inicio.page';

import { inicioPageRoutingModule } from './inicio-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    inicioPageRoutingModule
  ],
  declarations: [inicioPage]
})
export class InicioPageModule {}
