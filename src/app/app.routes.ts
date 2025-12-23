import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StudioGalleryComponent } from './components/studio-gallery/studio-gallery.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path:'gallary', component:StudioGalleryComponent
    }
];
