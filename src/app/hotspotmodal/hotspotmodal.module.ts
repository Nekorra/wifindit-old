import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HotspotmodalPageRoutingModule } from './hotspotmodal-routing.module';

import { HotspotmodalPage } from './hotspotmodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HotspotmodalPageRoutingModule
  ],
  declarations: [HotspotmodalPage]
})
export class HotspotmodalPageModule {}
