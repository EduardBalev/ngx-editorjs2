import {
  computed,
  Injectable,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemePickerService {
  static THEME_EXAMPLE_ICON = 'assets/img/theme-demo-icon.svg';
  static DEFAULT_THEME = 'red-palette';
  static THEME_STRORAGE_KEY: string = 'theme-picker-current-name';
  static DARK_MODE_STRORAGE_KEY: string = 'dark-mode';
  static THEMES: Map<string, string> = new Map([
    ['red-palette', 'Red'],
    ['green-palette', 'Green'],
    ['blue-palette', 'Blue'],
    ['yellow-palette', 'Yellow'],
    ['cyan-palette', 'Cyan'],
    ['magenta-palette', 'Magenta'],
    ['orange-palette', 'Orange'],
    ['chartreuse-palette', 'Chartreuse'],
    ['spring-green-palette', 'Spring Green'],
    ['azure-palette', 'Azure'],
    ['violet-palette', 'Violet'],
    ['rose-palette', 'Rose'],
  ]);

  darkMode = signal<boolean>(
    localStorage.getItem(ThemePickerService.DARK_MODE_STRORAGE_KEY) === 'true'
  );
  darkModeResource = resource({
    request: () => this.darkMode(),
    loader: async ({ request: darkMode }) => {
      await localStorage.setItem(
        ThemePickerService.DARK_MODE_STRORAGE_KEY,
        darkMode.toString()
      );
    },
  });

  userSelectedTheme = signal<string>(
    localStorage.getItem(ThemePickerService.THEME_STRORAGE_KEY) ?? ThemePickerService.DEFAULT_THEME
  );
  currentTheme = linkedSignal<string, string>({
    source: this.userSelectedTheme,
    computation: (newTheme, previous) => {
      return ThemePickerService.THEMES.has(newTheme) &&
        this.setThemeStyleAndLocalStorage(newTheme)
        ? newTheme
        : previous?.value ?? ThemePickerService.DEFAULT_THEME;
    },
  });

  setThemeStyleAndLocalStorage(newTheme: string) {
    localStorage.setItem(ThemePickerService.THEME_STRORAGE_KEY, newTheme);
    document.body.className = `${newTheme} ${
      this.darkMode() ? 'dark-mode' : 'light-mode'
    }`;
    return true;
  }
}
