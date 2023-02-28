import { FC, useEffect, useState } from "react";
import { transpile } from 'typescript'
import { default as MonacoEditor } from "@monaco-editor/react";
import { editor, KeyCode, KeyMod } from 'monaco-editor'
import { DefaultInput } from "./default";
import { NapiCompat } from "./libs";
import { useRecoilValue } from 'recoil'
import Heart from '@/icons/Heart';
import GitHub from '@/icons/GitHub';
import Book from '@/icons/Book';

import './index.scss'
import { sideBarWidthState } from "@/states";

export const Editor: FC<{
  timeout?: number
  onTranspile?: (err: Error | null, out: string) => void
  className?: string
}> = ({
  timeout,
  onTranspile,
  className,
}) => {
  const sidebarWidth = useRecoilValue(sideBarWidthState)
  const [code, setCode] = useState(DefaultInput)

  function beforeMount(monaco: typeof import("monaco-editor/esm/vs/editor/editor.api")) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(NapiCompat)
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      diagnosticCodesToIgnore: [1375, 1378]
    })
  }

  function onMount(editor: editor.IStandaloneCodeEditor) {
    editor.addAction({
      id: 'runcode',
      label: 'Transpiles and executes code in context.',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
      run(editor) {
        if (!onTranspile) return
        try {
          const result = transpile(editor.getValue(), { removeComments: true })
          onTranspile(null, result)
        } catch (error) {
          onTranspile(error as Error, '')
        }
      }
    })
  }

  useEffect(() => {
    if (!onTranspile || !timeout) return
    const to = setTimeout(() => {
      try {
        const result = transpile(code, { removeComments: true })
        onTranspile(null, result)
      } catch (error) {
        onTranspile(error as Error, '')
      }
    }, timeout)

    return () => clearTimeout(to)
  }, [code, timeout, onTranspile])

  return (
    <div className={`Editor ${className ?? ''}`}>
      <MonacoEditor
        defaultLanguage='typescript'
        theme='vs-dark'
        beforeMount={beforeMount}
        onMount={onMount}
        value={code}
        onChange={(v) => setCode(v ?? '')}
        width={`calc(100vw - ${sidebarWidth}px)`}
      />
      <AppVersion />
      <Contributing />
    </div>
  )
}

const AppVersion : FC = () => (
  <div className="AppVersion">
    <p className="ExtraSmall">{__APP_VERSION__}</p>
  </div>
)

const Contributing: FC = () => {
  return (
    <div className="Contributing">
      <a className="Button" href='https://github.com' target="_blank">
        <Heart />
      </a>
      <a className="Button" href='https://github.com' target="_blank">
        <GitHub />
      </a>
      <a className="Button" href='https://github.com' target="_blank">
        <Book />
      </a>
    </div>
  )
}
