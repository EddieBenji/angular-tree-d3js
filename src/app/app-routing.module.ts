import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './bar/bar.component';
import { PieComponent } from './pie/pie.component';
import { TreeComponent } from './tree/tree.component';

const routes: Routes = [
    { path: '', redirectTo: '/bar', pathMatch: 'full' },
    { path: 'bar', component: BarComponent },
    { path: 'pie', component: PieComponent },
    // { path: 'scatter', component: ScatterComponent },
    { path: 'tree', component: TreeComponent },
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}
