import { Injectable } from '@angular/core';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

@Injectable({
  providedIn: 'root'
})
export class HotspotService {
  networkID;
  results = [];
  info_txt = "";

  constructor(private hotspot: WifiWizard2) { 

  }

  async getNetworks() {
    this.info_txt = "loading...";
    try {
      let results = await this.hotspot.scan();
      this.results = results;
      this.info_txt = "";
    } catch (error) {
      this.info_txt = error;
    }
  }
}