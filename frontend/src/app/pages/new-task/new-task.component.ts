import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute,Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private notifyService: NotificationService, private route: ActivatedRoute, private router: Router) { }

  listId : string;
  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
       this.listId = params['listId'];
       console.log(this.listId);
      }
    )
  }

  createTask(title: string) {
    this.taskService.createTasks(title, this.listId).subscribe((newTask: Task) => {
      this.notifyService.showSuccess("New-Task Created", title);
      this.router.navigate(['/'], {relativeTo: this.route });
      console.log(title);
    })
  }
}
