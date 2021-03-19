import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleTreeTooltipComponent } from './collapsible-tree-tooltip.component';

describe('CollapsibleTreeTooltipComponent', () => {
  let component: CollapsibleTreeTooltipComponent;
  let fixture: ComponentFixture<CollapsibleTreeTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollapsibleTreeTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsibleTreeTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
