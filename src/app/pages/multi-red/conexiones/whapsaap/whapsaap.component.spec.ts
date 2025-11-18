import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhapsaapComponent } from './whapsaap.component';

describe('WhapsaapComponent', () => {
  let component: WhapsaapComponent;
  let fixture: ComponentFixture<WhapsaapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhapsaapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhapsaapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
