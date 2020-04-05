import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr'


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }

 showSuccess(message, title) {
   this.toastr.success(message, title)
 }

 showError(message) {
   this.toastr.info(message)
 }

 showWarning(message) {
   this.toastr.warning(message)
 }

}
