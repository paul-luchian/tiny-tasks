import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AppComponent } from './app.component';
import { TaskService } from './tasks/task.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let mockData: {
    taskService: jasmine.SpyObj<TaskService>,
    filterForm: FormGroup,
  };

  beforeEach(waitForAsync(() => {
    mockData = {
      taskService: jasmine.createSpyObj('TaskService', ['getAll', 'getFiltered']),
      filterForm: new FormGroup({ filterField: new FormControl('') }),
    };
    mockData.taskService.getFiltered.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        ChangeDetectorRef,
        { provide: 'TaskService', useValue: mockData.taskService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  describe('on destroy', () => {
    let nextSpy: jasmine.Spy;
    let completeSpy: jasmine.Spy;

    beforeEach(() => {
      nextSpy = spyOn((component as any).unsubscribe$, 'next');
      completeSpy = spyOn((component as any).unsubscribe$, 'complete');
      component.ngOnDestroy();
    });

    it('should call next on unsbuscribe$', () => {
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should complete unsbuscribe$', () => {
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('on setFilterForm', () => {
    const form: FormGroup = new FormGroup({
      filterName: new FormControl('filterValue'),
    });
    let detectChangesSpy: jasmine.Spy;
    let updateValueAndValiditySpy: jasmine.Spy;
    beforeEach(() => {
      updateValueAndValiditySpy = spyOn(form, 'updateValueAndValidity').and.callThrough();
      detectChangesSpy = spyOn((component as any).changeDetectorRef, 'detectChanges');
      component.setFilterForm(form);
    });

    it('should set the filterForm to the received form', () => {
      expect((component as any).filterForm.value).toEqual(form.value);
    });

    it('should set tasks$', () => {
      expect(component.tasks$).toEqual(jasmine.any(Observable));
    });

    it('should call changeDetectorRef.detectChanges for the template to be recheck', () => {
      expect(detectChangesSpy).toHaveBeenCalled();
    });

    it('should call updateValueAndValidity', () => {
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
    });

    it('should trigger form valueChanges on updateValueAndValidity', () => {
      component.tasks$?.subscribe();
      form.updateValueAndValidity();
      expect(mockData.taskService.getFiltered).toHaveBeenCalledWith({ filterName: 'filterValue' });
    });
  });

  describe('with filterForm setted', () => {
    let updateValueAndValiditySpy: jasmine.Spy;
    beforeEach(() => {
      updateValueAndValiditySpy = spyOn(mockData.filterForm, 'updateValueAndValidity').and.callThrough();
      fixture.detectChanges();
      component.setFilterForm(mockData.filterForm);
    });

    describe('on task create', () => {
      beforeEach(() => {
        mockData.taskService.getFiltered.and.returnValue(of([]));
        component.created();
      });

      it('should call form updateValueAndValidity', () => {
        expect(updateValueAndValiditySpy).toHaveBeenCalled();
      });

      it('should trigger filterForm valueChanges', () => {
        expect(mockData.taskService.getFiltered).toHaveBeenCalled();
      });
    });

    describe('on task deletion', () => {
      beforeEach(() => {
        mockData.taskService.getFiltered.and.returnValue(of([]));
        component.deleted();
      });

      it('should call form updateValueAndValidity', () => {
        expect(updateValueAndValiditySpy).toHaveBeenCalled();
      });

      it('should trigger filterForm valueChanges', () => {
        expect(mockData.taskService.getFiltered).toHaveBeenCalled();
      });
    });
  });
});
