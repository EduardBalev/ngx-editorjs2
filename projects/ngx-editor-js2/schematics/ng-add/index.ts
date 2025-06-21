import {
  apply,
  applyTemplates,
  mergeWith,
  move,
  Rule,
  chain,
  SchematicContext,
  Tree,
  url,
  MergeStrategy,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

const optionalBlocks: Record<
  string,
  {
    name: string;
    package: string;
    stylePath: string;
    peers: { package: string; version?: string }[];
  }
> = {
  image: {
    name: 'ngx-editor-js2-image',
    package: '@tmdjr/ngx-editor-js2-image',
    stylePath: 'dist/ngx-editor-js2-image',
    peers: [],
  },
  popQuiz: {
    name: 'ngx-editor-js2-pop-quiz',
    package: '@tmdjr/ngx-editor-js2-pop-quiz',
    stylePath: 'dist/ngx-editor-js2-pop-quiz',
    peers: [],
  },
  mermaidjs: {
    name: 'ngx-editor-js2-mermaidjs',
    package: '@tmdjr/ngx-editor-js2-mermaidjs',
    stylePath: 'dist/ngx-editor-js2-mermaidjs',
    peers: [
      { package: 'mermaid', version: '^11.6.0' },
      { package: '@ctrl/ngx-codemirror' },
      { package: '@types/codemirror' },
      { package: 'codemirror', version: '5.65.9' },
    ],
  },
  codemirror: {
    name: 'ngx-editor-js2-codemirror',
    package: '@tmdjr/ngx-editor-js2-codemirror',
    stylePath: 'dist/ngx-editor-js2-codemirror',
    peers: [
      { package: '@ctrl/ngx-codemirror' },
      { package: '@types/codemirror' },
      { package: 'codemirror', version: '5.65.9' },
    ],
  },
  mfeLoader: {
    name: 'ngx-editor-js2-mfe-loader',
    package: '@tmdjr/ngx-editor-js2-mfe-loader',
    stylePath: 'dist/ngx-editor-js2-mfe-loader',
    peers: [{ package: '@angular-architects/module-federation' }],
  },
  blockquotes: {
    name: 'ngx-editor-js2-blockquotes',
    package: '@tmdjr/ngx-editor-js2-blockquotes',
    stylePath: 'dist/ngx-editor-js2-blockquotes',
    peers: [],
  },
};

export function ngAdd(options: any): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    const blocks: string[] = options.blocks || [];

    blocks.forEach((block) => {
      const { package: pkg, peers } = optionalBlocks[block];
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: pkg,
        version: 'latest',
      });
      peers.forEach((peer) => {
        const type = peer.package.startsWith('@types/')
          ? NodeDependencyType.Dev
          : NodeDependencyType.Default;
        addPackageJsonDependency(tree, {
          type,
          name: peer.package,
          version: peer.version ?? 'latest',
        });
      });
    });

    context.addTask(new NodePackageInstallTask());

    const sourceRoot = options.project
      ? getProjectSourceRoot(tree, options.project)
      : 'src';

    updateStylesScss(tree, blocks, context, sourceRoot);
    updateAppConfig(tree, blocks, context, sourceRoot);
    addCodeMirrorSetup(tree, blocks, context, sourceRoot);

    if (options.demo) {
  const appPath = `${sourceRoot}/app`;

  if (tree.exists(appPath)) {
    context.logger.warn(`⚠️ Deleting existing app folder at ${appPath}`);
    // Ensure complete removal of the app directory and its content
    tree.delete(appPath);
  }

  rules.push(
    mergeWith(
      apply(url('./files/demo'), [
        applyTemplates({}),
        move(appPath),
      ]),
      MergeStrategy.Overwrite, // Explicitly overwrite files
    )
  );

  context.logger.info(`🚨 Demo files copied to ${appPath}. Existing app was replaced!`);
}

    context.logger.info('✅ Installation setup complete.');
    return chain(rules);
  };
}

function updateStylesScss(
  tree: Tree,
  blocks: string[],
  context: SchematicContext,
  sourceRoot: string
): void {
  const stylePath = `${sourceRoot}/styles.scss`;

  if (!tree.exists(stylePath)) {
    context.logger.error('❌ styles.scss not found.');
    return;
  }

  let content = tree.read(stylePath)!.toString();

  blocks.forEach((block) => {
    const importLine = `@use '${optionalBlocks[block].package}/styles/${optionalBlocks[block].name}-drag-preview.scss';`;

    if (!content.includes(importLine)) {
      content = `${importLine}\n${content}`;
    }
  });

  content = `@use '@tmdjr/ngx-editor-js2/styles/drag-preview.scss';\n${content}`;

  tree.overwrite(stylePath, content);
  context.logger.info('🎨 styles.scss updated successfully.');
}

function updateAppConfig(
  tree: Tree,
  blocks: string[],
  context: SchematicContext,
  sourceRoot: string
): void {
  const appConfigPath = `${sourceRoot}/app/app.config.ts`;

  if (!tree.exists(appConfigPath)) {
    context.logger.error(
      '❌ app.config.ts not found. Please manually add block components to NGX_EDITORJS_OPTIONS.'
    );
    return;
  }

  let content = tree.read(appConfigPath)!.toString();

  // imports
  const importLines = blocks.map(
    (block) =>
      `import { NgxEditorJs2${
        block.charAt(0).toUpperCase() + block.slice(1)
      }Component } from '${optionalBlocks[block].package}';`
  );
  if (!content.includes('NGX_EDITORJS_OPTIONS')) {
    content = `import { NGX_EDITORJS_OPTIONS } from '@tmdjr/ngx-editor-js2';\n${importLines.join(
      '\n'
    )}\n\n${content}`;
  } else {
    context.logger.warn(
      '⚠️ NgxEditorJs2 components already imported. Please ensure all components are imported correctly.'
    );
  }

  // providers
  const blockEntries = blocks.map((block) => {
    const className = `NgxEditorJs2${
      block.charAt(0).toUpperCase() + block.slice(1)
    }Component`;
    return `{
      name: '${block.charAt(0).toUpperCase() + block.slice(1)}',
      component: ${className},
      componentInstanceName: '${className}',
    }`;
  });

  const providerEntry = `{
    provide: NGX_EDITORJS_OPTIONS,
    useValue: {
      consumerSupportedBlocks: [
        ${blockEntries.join(',\n        ')}
      ],
    },
  }`;

  if (!content.includes('provide: NGX_EDITORJS_OPTIONS')) {
    content = content.replace(
      /providers:\s*\[/,
      `providers: [\n    ${providerEntry},`
    );
  } else {
    context.logger.warn(
      '⚠️ NGX_EDITORJS_OPTIONS provider already exists. Please manually update the blocks.'
    );
    return;
  }

  tree.overwrite(appConfigPath, content);
  context.logger.info('🚀 app.config.ts updated successfully.');
}

function addCodeMirrorSetup(
  tree: Tree,
  selectedBlocks: string[],
  context: SchematicContext,
  sourceRoot: string
): void {
  const needsCodeMirror = selectedBlocks.some((block) =>
    ['codemirror', 'mermaidjs'].includes(block)
  );

  if (!needsCodeMirror) {
    context.logger.info(
      'CodeMirror dependencies not selected; skipping setup.'
    );
    return;
  }

  // const bootstrapPath = `${sourceRoot}/bootstrap.ts`; // 20 change the location and name
  const bootstrapPath = `${sourceRoot}/main.ts`;
  const stylesPath = `${sourceRoot}/styles.scss`;

  // Update bootstrap.ts
  if (tree.exists(bootstrapPath)) {
    const bootstrapContent = tree.read(bootstrapPath)!.toString();

    const codeMirrorImports = `
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
`;

    if (!bootstrapContent.includes('CODEMIRROR Dependencies')) {
      tree.overwrite(bootstrapPath, bootstrapContent + codeMirrorImports);
      context.logger.info('CodeMirror imports added to bootstrap.ts');
    }
  } else {
    context.logger.warn(`bootstrap.ts not found at path: ${bootstrapPath}`);
  }

  // Update styles.scss
  if (tree.exists(stylesPath)) {
    const stylesContent = tree.read(stylesPath)!.toString();

    const codeMirrorStyles = `
@use "codemirror/lib/codemirror";
@use "codemirror/theme/material-palenight";
`;

    if (!stylesContent.includes('CODEMIRROR Dependencies')) {
      tree.overwrite(stylesPath, codeMirrorStyles + stylesContent);
      context.logger.info('CodeMirror styles added to styles.scss');
    }
  } else {
    context.logger.warn(`styles.scss not found at path: ${stylesPath}`);
  }
}

function getProjectSourceRoot(tree: Tree, projectName: string): string {
  const buffer = tree.read('/angular.json');
  if (!buffer) throw new Error('angular.json not found');
  const workspace = JSON.parse(buffer.toString());
  const project = workspace.projects[projectName];
  if (!project) throw new Error(`Project ${projectName} not found`);
  return project.sourceRoot || 'src';
}
