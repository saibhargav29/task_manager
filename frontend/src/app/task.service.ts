import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/task.model';


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  
  getLists() {
    return this.webReqService.get('lists');
  }
 
  createList(title: string) {
  return this.webReqService.post('lists', { title });  
  }

  updateList(id: string, title: string) {
    return this.webReqService.patch(`lists/${id}`, { title });  
  }

  updateTask(listId: string,taskId: string, title: string) {
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });  
  }


  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }
  
  deleteTask(listId: string, taskId: string) {
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  getTasks(listId: string) {
    return this.webReqService.get(`lists/${listId}/tasks`);
  }  

  createTasks(title: string, listId: string) {
    return this.webReqService.post(`lists/${listId}/tasks`, { title });  
  } 

  complete(task: Task) {
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`,{
      completed: !task.completed
    });
     
  }

}
