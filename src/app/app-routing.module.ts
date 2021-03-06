import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './bar/bar.component';
import { CollapsibleTreeTooltipComponent } from './collapsible-tree-tooltip/collapsible-tree-tooltip.component';
import { CollapsibleTreeComponent } from './collapsible-tree/collapsible-tree.component';
import { PieComponent } from './pie/pie.component';
import { TreeComponent } from './tree/tree.component';

const routes: Routes = [
    { path: '', redirectTo: '/collapsible-tree', pathMatch: 'full' },
    // { path: 'bar', component: BarComponent },
    // { path: 'pie', component: PieComponent },
    // { path: 'scatter', component: ScatterComponent },
    // { path: 'tree', component: TreeComponent },
    { path: 'collapsible-tree', component: CollapsibleTreeComponent },
    { path: 'collapsible-tree-tooltip', component: CollapsibleTreeTooltipComponent },
    { path: '**', redirectTo: '/collapsible-tree' }, // no special page for requests that are not found.
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}
