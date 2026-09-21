import Babel from '@babel/standalone';
import reactRuntime from '../assets/react.development.js?raw';
import reactDomRuntime from '../assets/react-dom.development.js?raw';

export function compileJsx(source = '') {
  try {
    const result = Babel.transform(String(source), {
      presets: ['react'],
      sourceType: 'script',
    });
    return {
      code: result.code ?? '',
      warnings: [],
    };
  } catch (error) {
    return {
      code: '',
      warnings: [`JSX: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

export function getReactRuntimeScripts() {
  return {
    react: reactRuntime,
    reactDom: reactDomRuntime,
  };
}
