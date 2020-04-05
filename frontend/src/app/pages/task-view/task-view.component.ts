import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute,Params, Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[];
  tasks: Task[];


  selectedListId: string;

  constructor(private taskService: TaskService, private notifyService: NotificationService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        if (params.listId) {
            this.selectedListId = params.listId;
            this.taskService.getTasks(params.listId).subscribe((tasks: any[]) => {
            this.tasks = tasks;
          })
        } else {
          this.tasks  = undefined;
        }
      }
    )
    this.taskService.getLists().subscribe((lists: List[]) => {
      this.lists = lists;
    })
  }
  
  onTaskClick(task: Task) {
      this.taskService.complete(task).subscribe(()=> {
      console.log("completed successfully");
      task.completed = !task.completed;
      if(task.completed) {
        this.notifyService.showSuccess("Completed",task.title);
      } else {
        this.notifyService.showSuccess("Pending",task.title);
      }
    })
  }

  onDeleteListClick() {

    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.notifyService.showWarning("List Deleted Successfully");
        this.router.navigate(['/lists']); 
        console.log(res);
    })
  }
  onDeleteTaskClick(id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
      this.notifyService.showWarning("Task Deleted Successfully");
      this.tasks = this.tasks.filter(val => val._id !== id);  
      console.log(res);
    })
  }

}
  