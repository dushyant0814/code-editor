import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

const languages = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp'];

const CollaborativeCodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    // Load type definitions for better IntelliSense
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
    });

    // Add custom library for Node.js global objects and methods
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare var console: {
        log(...data: any[]): void;
        info(...data: any[]): void;
        warn(...data: any[]): void;
        error(...data: any[]): void;
      };
    `, 'globals.d.ts');

  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code.${language}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = () => {
    if (language !== 'javascript') {
      setOutput(`Execution for ${language} is not supported in the browser. This would require a backend service.`);
      return;
    }

    setOutput('');
    
    const originalLog = console.log;
    console.log = (...args) => {
      setOutput(prev => prev + args.join(' ') + '\n');
    };

    try {
      new Function(code)();
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      console.log = originalLog;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl">Collaborative Code Editor</h1>
        <div className="flex items-center">
          <label htmlFor="language-select" className="mr-2">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="bg-white text-black p-1 rounded"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </header>
      <main className="flex-grow flex">
        <div className="w-1/2 relative">
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true },
              quickSuggestions: true,
              quickSuggestionsDelay: 10,
              snippetSuggestions: 'top',
              wordBasedSuggestions: true,
              tabCompletion: 'on',
            }}
          />
        </div>
        <div className="w-1/2 bg-gray-900 text-white p-4 overflow-auto">
          <h2 className="text-xl mb-2">Output:</h2>
          <pre>{output}</pre>
        </div>
      </main>
      <footer className="bg-gray-800 p-4 flex justify-between">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSave}
        >
          Save to Device
        </button>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleExecute}
        >
          Execute Code
        </button>
      </footer>
    </div>
  );
};

export default CollaborativeCodeEditor;