import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Task } from './tasks/task';
import { TaskService } from './tasks/task.service';

@Component({
  selector: 'tiny-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {

  tasks$: Observable<Task[]> | undefined;

  private filterForm: FormGroup | undefined;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    @Inject('TaskService') private taskService: TaskService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete();
  }

  created(): void { this.filterForm!.updateValueAndValidity(); }

  deleted(): void { this.filterForm!.updateValueAndValidity(); }

  setFilterForm(filterForm: FormGroup): void {
    this.filterForm = filterForm;
    this.tasks$ = this.filterForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((data) => (this.taskService.getFiltered(data)))
      );
    this.changeDetectorRef.detectChanges();
    this.filterForm.updateValueAndValidity();
  }
}
