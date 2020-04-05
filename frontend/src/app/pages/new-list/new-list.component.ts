import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { Router } from '@angular/router';
//import { Task } from 'src/app/models/task.model';
import { List } from 'src/app/models/list.model';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskService: TaskService, private notifyService: NotificationService, private router: Router) { }

  ngOnInit() {
  }
  createList(title: string) {
    this.taskService.createList(title).subscribe((list: List) => {
      this.notifyService.showSuccess("New-List Created", title);
      console.log(list);
      this.router.navigate([ '/lists', list._id ]);
    });
  }

}
