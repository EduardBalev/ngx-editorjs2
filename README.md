# Ngx-EditorJs2

## Overview
Ngx-EditorJs2 is an Angular-based, highly extensible block-style editor inspired by Editor.js. It allows users to create and manage rich text content using a variety of customizable blocks while leveraging Angular's reactive capabilities.

## Features
- 📝 **Modular Block System** – Supports paragraph, header, and other content blocks.
- 🔄 **Reactive Data Streams** – Uses RxJS for efficient state management.
- 🎛 **Drag & Drop** – Easily reorder blocks with smooth animations.
- ✍ **Inline Toolbar** – Provides text formatting options when selecting text.
- 🔧 **Customizable** – Easily extendable with new block types and actions.

## Installation
To install Ngx-EditorJs2, run:

```sh
npm install @tmdjr/ngx-editorjs2
```

## Usage
Import the module into your Angular application:

```ts
import { NgxEditorJs2Module } from '@tmdjr/ngx-editorjs2';

@NgModule({
  imports: [NgxEditorJs2Module],
})
export class AppModule {}
```

Then, use it in your component:

```html
<ngx-editor-js2
  [blocks]="initialBlocks"
  (blocksRequested)="handleBlocks($event)">
</ngx-editor-js2>
```

## API
### **Inputs**
| Property      | Type                        | Description |
|--------------|----------------------------|-------------|
| `blocks`     | `NgxEditorJsBlock[]`       | List of blocks to initialize the editor with. |
| `requestBlocks` | `Function` | Emits an event to request block data. |

### **Outputs**
| Event          | Description |
|---------------|-------------|
| `blocksRequested` | Emits when blocks are loaded. |

## Block Components
Ngx-EditorJs2 comes with built-in block components:
- **ParagraphBlockComponent** – Standard text block.
- **HeaderBlockComponent** – Allows different heading levels.

You can also create custom blocks by implementing the `BlockComponent` interface.

## Services
| Service                   | Purpose |
|---------------------------|---------|
| `NgxEditorJs2Service`     | Manages available block types and loaded blocks. |
| `EditorJsService`         | Handles block rendering and form controls. |
| `BlockMovementService`    | Manages drag-and-drop reordering. |
| `ToolbarInlineService`    | Manages inline text formatting. |
| `ToolFabService`          | Provides contextual toolbars for block actions. |

## Development
To contribute, clone the repository and install dependencies:

```sh
git clone https://github.com/tmdjr/ngx-editorjs2.git
cd ngx-editorjs2
npm install
```

Run the development server:

```sh
npm start
```

## License
MIT License © 2025 [Wesley DuSell](https://github.com/ba5ik7)

