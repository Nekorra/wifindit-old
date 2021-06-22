import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HotspotmodalPage } from './hotspotmodal.page';

const routes: Routes = [
  {
    path: '',
    component: HotspotmodalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HotspotmodalPageRoutingModule {}
