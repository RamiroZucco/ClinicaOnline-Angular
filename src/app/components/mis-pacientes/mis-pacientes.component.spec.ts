import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPacientesComponent } from './mis-pacientes.component';

describe('MisPacientesComponent', () => {
  let component: MisPacientesComponent;
  let fixture: ComponentFixture<MisPacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPacientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisPacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
