import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { prompt } from 'enquirer';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

const optionalBlocks: Record<
  string,
  { name: string; package: string; stylePath: string; peers: string[] }
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
    peers: ['mermaid', '@ctrl/ngx-codemirror', '@types/codemirror'],
  },
  codemirror: {
    name: 'ngx-editor-js2-codemirror',
    package: '@tmdjr/ngx-editor-js2-codemirror',
    stylePath: 'dist/ngx-editor-js2-codemirror',
    peers: ['@ctrl/ngx-codemirror', '@types/codemirror'],
  },
  mfeLoader: {
    name: 'ngx-editor-js2-mfe-loader',
    package: '@tmdjr/ngx-editor-js2-mfe-loader',
    stylePath: 'dist/ngx-editor-js2-mfe-loader',
    peers: ['@angular-architects/module-federation'],
  },
  blockquotes: {
    name: 'ngx-editor-js2-blockquotes',
    package: '@tmdjr/ngx-editor-js2-blockquotes',
    stylePath: 'dist/ngx-editor-js2-blockquotes',
    peers: [],
  },
};

export function ngAdd(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const response = await prompt<{ blocks: string[] }>({
      type: 'multiselect',
      name: 'blocks',
      message: 'Select optional Ngx-Editor-JS2 blocks to install:',
      choices: Object.keys(optionalBlocks).map((block) => ({
        name: block,
        message: block,
      })),
    });

    response.blocks.forEach((block) => {
      const { package: pkg, peers } = optionalBlocks[block];
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: pkg,
        version: 'latest',
      });
      peers.forEach((peer) => {
        const type = peer.startsWith('@types/')
          ? NodeDependencyType.Dev
          : NodeDependencyType.Default;
        addPackageJsonDependency(tree, {
          type,
          name: peer,
          version: 'latest',
        });
      });
    });

    context.addTask(new NodePackageInstallTask());

    const sourceRoot = await getSourceRoot(tree, context);

    updateStylesScss(tree, response.blocks, context, sourceRoot);

    updateAppConfig(tree, response.blocks, context, sourceRoot);

    context.logger.info('✅ Installation setup complete.');

    return tree;
  };
}

async function getSourceRoot(
  tree: Tree,
  context: SchematicContext
): Promise<string> {
  const buffer = tree.read('/angular.json');

  if (!buffer) {
    context.logger.error('❌ angular.json not found.');
    throw new Error('angular.json not found... get good');
  }

  const angularJson = JSON.parse(buffer.toString());

  // We need to get every project in the workspace
  const projects = Object.keys(angularJson.projects);
  // We will prompt the user to select a project
  const response = await prompt<{ project: string }>({
    type: 'select',
    name: 'project',
    message: 'Select the Angular project to update:',
    choices: projects.map((project) => ({
      name: project,
      message: project,
    })),
  });
  const project = response.project;

  if (!project || !angularJson.projects[project]) {
    context.logger.error(`❌ Project ${project} not found in angular.json.`);
    throw new Error(`Project ${project} not found in angular.json`);
  }

  return angularJson.projects[project].sourceRoot;
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

// async function updateAngularJson(
//   tree: Tree,
//   blocks: string[],
//   context: SchematicContext
// ): Promise<string> {
//   const angularJsonPath = '/angular.json';
//   const buffer = tree.read(angularJsonPath);

//   if (!buffer) {
//     context.logger.error('❌ angular.json not found.');
//     throw new Error('angular.json not found... get good');
//   }

//   const angularJson = JSON.parse(buffer.toString());

//   // const project = angularJson.defaultProject;
//   // We need to get every project in the workspace
//   const projects = Object.keys(angularJson.projects);
//   // We will prompt the user to select a project
//   const response = await prompt<{ project: string }>({
//     type: 'select',
//     name: 'project',
//     message: 'Select the Angular project to update:',
//     choices: projects.map((project) => ({
//       name: project,
//       message: project,
//     })),
//   });
//   const project = response.project;

//   if (!project || !angularJson.projects[project]) {
//     context.logger.error(`❌ Project ${project} not found in angular.json.`);
//     throw new Error(`Project ${project} not found in angular.json`);
//   }

//   const includePaths =
//     angularJson.projects[project].architect.build.options
//       .stylePreprocessorOptions?.includePaths || [];

//   includePaths.push('dist/ngx-editor-js2');
//   blocks.forEach((block) => {
//     const stylePath = optionalBlocks[block].stylePath;
//     if (!includePaths.includes(stylePath)) {
//       includePaths.push(stylePath);
//     }
//   });

//   angularJson.projects[
//     project
//   ].architect.build.options.stylePreprocessorOptions = { includePaths };
//   tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));

//   context.logger.info('🔧 angular.json updated successfully.');

//   return (
//     angularJson.projects[project].sourceRoot ||
//     angularJson.projects[project].root
//   );
// }
