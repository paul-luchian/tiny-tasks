import { TestBed } from '@angular/core/testing';
import { LocalTaskService } from './local-task.service';
import { Observable } from 'rxjs';
import { Task } from './task';

describe('LocalTaskService', () => {
  const id = 'de4f576e-d1b5-488a-8c77-63d4c8726909';
  const name = 'Doing the do!';
  const mockTask = `{"id":"${id}","name":"${name}"}`;

  let taskService: LocalTaskService;
  let localStorageGetSpy: jasmine.Spy;
  let localStorageSetSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalTaskService]
    });

    taskService = TestBed.inject(LocalTaskService);
    localStorageGetSpy = spyOn(localStorage, 'getItem');
    localStorageSetSpy = spyOn(localStorage, 'setItem');
    localStorageGetSpy.and.callFake(() => `[${mockTask}]`);
    localStorageSetSpy.and.callFake(() => { });
  });

  it('should be created', () => {
    expect(taskService).toBeTruthy();
  });

  it('should return tasks from local storage', () => {
    // when
    const taskList$: Observable<Task[]> = taskService.getAll();

    // then
    expect(localStorage.getItem).toHaveBeenCalled();
    taskList$.subscribe(taskList => {
      expect(taskList.length).toBe(1);
      expect(taskList[0].name).toEqual(name);
    });
  });

  describe('on getFiltered', () => {
    let filter: Record<string, any>;
    it('should return empty array if taskName not found', () => {
      //given
      filter = { taskName: 'taskValue' };
      // when
      const taskList$: Observable<Task[]> = taskService.getFiltered(filter);
      // then
      taskList$.subscribe((taskList) => { expect(taskList).toEqual([]); });
    });

    it('should return array with founded taskNames', () => {
      //given
      filter = { taskName: 'Doing' };
      // when
      const taskList$: Observable<Task[]> = taskService.getFiltered(filter);
      // then
      taskList$.subscribe((taskList) => { expect(taskList.length).toEqual(1); });
    });

    it('should return entire array if filter empty', () => {
      //given
      filter = { taskName: '' };
      // when
      const taskList$: Observable<Task[]> = taskService.getFiltered(filter);
      // then
      taskList$.subscribe((taskList) => { expect(taskList.length).toEqual(1); });
    });

    it('should return entire array if filter not setted', () => {
      // when
      const taskList$: Observable<Task[]> = taskService.getFiltered(null as any);
      // then
      taskList$.subscribe((taskList) => { expect(taskList.length).toEqual(1); });
    });
  });

  it('should return tasks from an empty local storage', () => {
    // given
    localStorageGetSpy.and.callFake(() => null);

    // when
    const taskList$: Observable<Task[]> = taskService.getAll();

    // then
    expect(localStorage.getItem).toHaveBeenCalled();
    taskList$.subscribe(taskList => {
      expect(taskList.length).toBe(0);
    });
  });

  it('should write task to local storage', () => {
    // when
    taskService.create('Drinking the drink!');

    // then
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should delete task from local storage', () => {
    // when
    taskService.delete(id);

    // then
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should handle unknown task on deletion', () => {
    // when
    taskService.delete('unknown');

    // then
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
