import { NgModule } from '@angular/core';
import { AuraComponent } from './components/aura.component';
import { AuraRoutingModule } from './aura-routing.module';
import { SharedModule } from '../shared/shared.module';
import { BreadCrumbBarComponent } from './components/bread-crumb-bar/bread-crumb-bar.component';

@NgModule({
  declarations: [AuraComponent, BreadCrumbBarComponent],
  imports: [AuraRoutingModule, SharedModule],
  exports: [AuraComponent, BreadCrumbBarComponent],
})
export class AuraModule {}
