import { sideBarWidthState } from "@/states"
import { cn } from "@/utils"
import { FC, useEffect, useState } from "react"
import { useRecoilState } from 'recoil'

import './SideBar.scss'

export const SideBar: FC = () => {
  // Current width of the sidebar
  const [width, setWidth] = useRecoilState(sideBarWidthState)
  // Whether we are currently resizing or not
  const [resizing, setResizing] = useState(false)
  // Cached resize offset from when resize is invoked
  const [rOffset, setROffset] = useState(0)

  const id = 'SideBar-DragArea-GWEiuo4htui'

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [
    width,
    resizing,
    rOffset,
  ])

  function onMouseDown(event: MouseEvent) {
    // Get the targer element as an HTMLElement
    const elm = event.target as HTMLElement | null

    if (elm?.id !== id) return

    event.preventDefault()
    setROffset(event.clientX - width)

    setResizing(true)
  }

  function onMouseUp(event: MouseEvent) {
    if (!resizing) return
    event.preventDefault()
    setResizing(false)
  }

  function onMouseMove(event: MouseEvent) {
    if (!resizing) return

    if (event.clientX - rOffset < 160)
      return setWidth(4)

    const x = Math.Clamp(event.clientX - rOffset, 304, 400)
    setWidth(x)
  }

  return (
    <div
      className={cn({
        'SideBar': true,
        'Resizing': resizing,
      })}
      style={{
        width: width ?? 0,
        cursor: resizing ? 'e-resize' : 'unset'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="SideBarContent">
        <List title="Current State">
          <><Inline>createCanvas</Inline> method supported.</>
          <>All methods for canvas 2d rendering context supported.</>
          <><Inline>loadImage</Inline> <u>NOT</u> supported yet.</>
          <>Unsafe transpilation/evaluation of code.</>
          <><Inline>finish</Inline> method does nothing at the moment.</>
          <>Canvas is unsafely inserted into dom to keep <Inline>createCanvas</Inline> synchronous.</>
          <>No codegen output for <i>@napi-rs/canvas</i> yet.</>
          <>Multiple canvases not supported as of this time.</>
          <>Uploading images not yet supported.</>
          <>Zoom in/out scale button on canvas window needed for larger renders.</>
          <>Website scale is very bad, fix Monaco editor default size so website can be tweaked.</>
        </List>
        <List title="Changelog">
          <>Nothing important yet.</>
        </List>
      </div>
      <div id={id} className="DragArea"></div>
    </div>
  )
}

const List: FC<{ title: string, children?: React.ReactNode[] | React.ReactNode }> = ({
  title,
  children,
}) => {
  const a = Array.isArray(children) ? children : children ? [children] : []

  return (
    <section className="CustomList">
      <h5 className="Title">{title}</h5>
      <ul>
        {a.map((i) => <li>{i}</li>)}
      </ul>
    </section>
  )
}

const Inline: FC<{ children: string }> = ({ children }) => (
  <span className="Inline">{children}</span>
)
