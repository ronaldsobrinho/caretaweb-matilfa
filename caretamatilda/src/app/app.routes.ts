import { Routes } from '@angular/router';
import { TodayComponent } from './pages/today/today.component';
import { HomeComponent } from './pages/home.component/home.component';
import { RouterModule } from '@angular/router';


export const routes: Routes = [
     { path: '', component: HomeComponent },
  { path: 'hoje', component: TodayComponent },
  { path: '**', redirectTo: '' }

];
