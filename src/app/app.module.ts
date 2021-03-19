import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BarComponent } from './bar/bar.component';
import { PieComponent } from './pie/pie.component';
import { ScatterComponent } from './scatter/scatter.component';
import { TreeComponent } from './tree/tree.component';
import { CollapsibleTreeComponent } from './collapsible-tree/collapsible-tree.component';
import { CollapsibleTreeTooltipComponent } from './collapsible-tree-tooltip/collapsible-tree-tooltip.component';

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    PieComponent,
    ScatterComponent,
    TreeComponent,
    CollapsibleTreeComponent,
    CollapsibleTreeTooltipComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
