import { Draggable, Draggable2 } from "@/components/Draggable";
import { SideBar } from "@/components/SideBar";
import { Editor } from "@/editor";
import { FC, useRef } from "react";

import './Main.scss'

export const Main: FC = () => {
  const ref = useRef<HTMLDivElement | null>(null)

  function unsafelySetElement(elm: HTMLElement | string) {
    if (!ref.current) return
    ref.current.firstChild?.remove()
    ref.current.prepend(elm)
  }

  function onTranspile(err: Error | null, out: string) {
    if (err) {
      unsafelySetElement(UseError(err))
      return console.error(err)
    }

    function createCanvas(w: number, h: number) {
      const canvas = document.createElement('canvas')
      canvas.id = 'MainCanvasContext'
      canvas.width = w
      canvas.height = h

      unsafelySetElement(canvas)

      return canvas
    }

    function finish(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      void [canvas, ctx];
    }

    // We need to basically redefine the functions in the eval
    // Otherwise the minifier will butcher the code.
    ;(async () => eval(`
      var createCanvas = ${createCanvas}; 
      var finish = ${finish};
      ${out}
    `))()
      .catch((err) => {
        unsafelySetElement(UseError(err as Error))
        return console.error(err)
      })
  }

  return (
    <div className="Main">
      <div className="Shared">
        <SideBar />
        <Editor onTranspile={onTranspile} />
      </div>
      <Draggable2 ref={ref} children={<div className="Center"><p className="Small">Use CTRL/CMD + S to run!</p></div>} />
    </div>
  )
} 

export const UseError = (err: Error): string =>
  `<div className="Error"><pre>${String(err)}</pre></div>`

