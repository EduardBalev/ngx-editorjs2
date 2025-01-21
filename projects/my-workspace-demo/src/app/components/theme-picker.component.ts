import { KeyValuePipe } from '@angular/common';
import { Component, inject, input, Signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ThemePickerService } from '../services/theme-picker.service';

// Menu Item
@Component({
  selector: 'app-theme-picker-menu-item',
  imports: [MatMenuItem, MatIcon],
  template: `
    <button mat-menu-item>
      @if (isCurrentTheme(); as isCurrentTheme) {
      <mat-icon class="docs-theme-selected-icon">radio_button_checked</mat-icon>
      } @else {
      <mat-icon>radio_button_unchecked</mat-icon>
      }
      <span>{{ themeText() }}</span>
    </button>
  `,
})
export class ThemePickerMenuItemComponent {
  themeText = input.required<string>();
  isCurrentTheme = input.required<boolean>();
}
// Menu
@Component({
  selector: 'app-theme-picker',
  imports: [
    MatIconButton,
    KeyValuePipe,
    MatMenu,
    MatMenuTrigger,
    MatIcon,
    MatTooltip,
    MatSlideToggle,
    ThemePickerMenuItemComponent,
    MatMenuItem,
  ],
  template: `
    <button
      mat-icon-button
      [mat-menu-trigger-for]="themeMenu"
      matTooltip="Select a theme for the documentation"
    >
      <mat-icon>format_color_fill</mat-icon>
    </button>

    <mat-menu #themeMenu="matMenu" xPosition="before">
      <div mat-menu-item>
        <mat-slide-toggle
          [checked]="darkMode()"
          (toggleChange)="toggleDarkMode()"
          >Dark Mode</mat-slide-toggle
        >
      </div>
      @for (theme of themes | keyvalue; track $index) {
      <app-theme-picker-menu-item
        [themeText]="theme.value"
        [isCurrentTheme]="theme.key === currentTheme()"
        (click)="selectTheme(theme.key)"
      ></app-theme-picker-menu-item>
      }
    </mat-menu>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        button {
          @include mat.icon-overrides(
            (
              color: var(--mat-sys-primary),
            )
          );
        }
      }
    `,
  ],
})
export class ThemePickerComponent {
  themePickerService = inject(ThemePickerService);
  themes = ThemePickerService.THEMES;
  currentTheme = this.themePickerService.currentTheme;
  darkMode = this.themePickerService.darkMode;

  selectTheme(theme: string): void {
    this.themePickerService.userSelectedTheme.set(theme);
  }

  toggleDarkMode(): void {
    this.themePickerService.darkMode.set(!this.darkMode());
  }
}
