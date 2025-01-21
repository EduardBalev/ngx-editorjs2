import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hero',
  imports: [MatButtonModule],
  template: `
    <header class="header-background">
      <div class="header-section">
        <div class="header-headline">
          <h1>Ngx EditorJs2</h1>
          <h2>A Custom Themeable Angular Material 3 Component</h2>
        </div>
        <div class="header-start">
          <button mat-flat-button (click)="getValue()">Save Blocks</button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        width: 100%;
        .header-background {
          overflow: hidden;
          position: relative;
          height: 360px;
          background: var(--mat-sys-secondary);
          color: var(--mat-sys-on-secondary);
          &::before {
            content: '';
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" fill="%23FFFFFF"><path d="M14.5 40V13H4V8h26v5H19.5v27Zm18 0V23H26v-5h18v5h-6.5v17Z"/></svg>');
            background-repeat: no-repeat;
            background-size: 400px;
            background-position: 80% -25px;
            opacity: 0.2;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
          }
        }
        .header-section {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          height: 100%;
          text-align: center;
        }
        .header-headline {
          h1 {
            font-size: 56px;
            font-weight: bold;
            line-height: 56px;
            margin: 15px 5px;
          }
          h2 {
            font-size: 20px;
            font-weight: 300;
            line-height: 28px;
            margin: 15px 0 25px 0;
          }
        }
      }
    `,
  ],
})
export class HeroComponent {
  getValue() {
    console.log('Get Value');
  }
}
