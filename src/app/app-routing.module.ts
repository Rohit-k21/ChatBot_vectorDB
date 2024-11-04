import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat-page/chat-page.component';
import { UploadDataComponent } from './upload-data/upload-data.component';

const routes: Routes = [
  { path: '', component: ChatComponent },
  { path: 'uploaddata', component: UploadDataComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
