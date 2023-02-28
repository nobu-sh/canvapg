import Maximize from '@/icons/Maximize';
import Minimize from '@/icons/Minimize';
import { Vector2 } from '@/utils';
import { FC, forwardRef, ReactNode, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './Draggable.scss'

export const Draggable2 = forwardRef<
  HTMLDivElement,
  {
    children?: ReactNode;
    name?: string;
    startSize?: Vector2;
    startPosition?: Vector2;
    maxWidth?: number;
    maxHeight?: number;
  }
>(({
  children,
  name,
  startSize,
  startPosition,
  maxWidth,
  maxHeight,
}, ref) => {
  // Current size of the draggable object
  const [size, setSize] = useState(Vector2(
    // Use start width or 300
    startSize?.x ?? 300,
    // Use start height or 200
    startSize?.y ?? 200,
  ))
  // Current position of the draggable object
  const [pos, setPos] = useState(Vector2(
    // Use start position or put it in the top right
    startPosition?.x ?? window.innerWidth - size.x - 120,
    startPosition?.y ?? 24,
  ))

  // Whether we are currently dragging or not
  const [dragging, setDragging] = useState(false)
  // Whether we are currently resizing or not
  const [resizing, setResizing] = useState(false)

  // Cached resize offset from when resize is invoked
  const [rOffset, setROffset] = useState(Vector2.zero)
  // Cached position offset from when drag is invoked
  const [pOffset, setPOffset] = useState(Vector2.zero)
  // Window size cache variable for resize recalculations
  const [winCache, setWinCache] = useState(Vector2(
    window.innerWidth,
    window.innerHeight
  ))

  // Minimize state
  const [minimized, setMinimized] = useState(false)
  const [cachedSize, setCachedSize] = useState(size)

  // Identifier of the drag component.
  const id = useMemo(() => `DraggableAsset-${uuidv4()}`, [])
  // Identifier of the resize component.
  const resizeId = useMemo(() => `ResizePoint-${id}`, [id])

  // Effect for register/cleanup of event listeners on mount/unmount
  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onWindowResize)
    }
  }, [
    id,
    resizeId,
    size,
    pos, 
    dragging,
    resizing,
    pOffset,
    rOffset,
    winCache,
    maxWidth,
    maxHeight,
  ])

  // On global mouse down event
  function onMouseDown(event: MouseEvent) {
    // Get the targer element as an HTMLElement
    const elm = event.target as HTMLElement | null
    // We want to try to use the current element,
    // but in case they are clicking on inner contents
    // we also need to consider the parent element.
    // from my testing offsetParent seems to work.
    const ids = [elm?.id, elm?.offsetParent?.id]

    // Check if the action is a drag action
    const isDrag = ids.includes(id)
    // Check is the action is a resize action
    const isResize = ids.includes(resizeId)
    
    // If it is neither return.
    if (!isDrag && !isResize) return

    // Prevent default actions.
    event.preventDefault()

    // Calculate the position offsets for dragging
    // and resizing the component.
    const pOffsetX = event.clientX - pos.x
    const pOffsetY = pos.y - event.clientY
    setPOffset(Vector2(pOffsetX, pOffsetY))
    setROffset(Vector2(
      size.x - pOffsetX,
      size.y + pOffsetY
    ))

    // Depending on the action set the correct state.
    if (isResize)
      setResizing(true)
    else
      setDragging(true)
  }

  // On mouse up event a.k.a release
  function onMouseUp(event: MouseEvent) {
    // If we are resizing set resizing to false.
    if (resizing) {
      event.preventDefault()
      setResizing(false)
    // If we are dragging set dragging to false.
    } else if (dragging) {
      event.preventDefault()
      setDragging(false)
    }
  }

  // On mouse move event.
  function onMouseMove(event: MouseEvent) {
    // If we are currently resizing.
    if (resizing) {
      event.preventDefault()

      // Calculate the x and clamp it to specified parameters.
      const x = Math.Clamp(
        event.clientX - pos.x + rOffset.x,
        150,
        maxWidth ?? window.innerWidth
      )
      // Calculate y and clamp it to specified parameters.
      const y =  Math.Clamp(
        event.clientY - pos.y + rOffset.y,
        24,
        maxHeight ?? window.innerHeight
      )

      // If below this threshold we consider it collapsed
      if (x < 180 && y < 54) {
        setMinimized(true)
        setCachedSize(Vector2(
          // Use start width or 300
          startSize?.x ?? 300,
          // Use start height or 200
          startSize?.y ?? 200,
        ))
      } else setMinimized(false)

      // Set the size.
      setSize(Vector2(x, y))
    // Otherwise if dragging.
    } else if (dragging) {
      event.preventDefault()

      // Calculate the x point and clamp it to specified parameters.
      const x = Math.Clamp(event.clientX - pOffset.x, 0, window.innerWidth - size.x)
      // Calculate the y point and clamp it to specified parameters.
      const y = Math.Clamp(event.clientY + pOffset.y, 0, window.innerHeight - size.y)

      // Set the position.
      setPos(Vector2(x, y))
    }
  }

  // On the window changing size event.
  function onWindowResize(event: UIEvent) {
    // Calculate the relative offsets for the element to keep it in the samish position.
    const xOffset = winCache.x - window.innerWidth
    // const yOffset = window.innerHeight - winCache.y

    // Calculate the x point and clamp it to specified parameters.
    const x = Math.Clamp(pos.x - xOffset, 0, window.innerWidth - size.x)
    // Calculate the y point and clamp it to specified parameters.
    // const y = Math.Clamp(pos.y + yOffset, 0, window.innerHeight - size.y)
    const y = Math.Clamp(pos.y, 0, window.innerHeight - size.y)

    // Set new position.
    setPos(Vector2(x, y))
    // Update the window size cache.
    setWinCache(Vector2(window.innerWidth, window.innerHeight))
  }

  // Used for the minimize and expand functionality
  function minimizeOrExpand() {
    if (minimized) {
      setMinimized(false)

      // Ensure that it cannot clip outside window.
      const x = pos.x + cachedSize.x > window.innerWidth ? window.innerWidth - pos.x : cachedSize.x
      const y = pos.y + cachedSize.y > window.innerHeight ? window.innerHeight - pos.y : cachedSize.y

      return setSize(Vector2(x, y))
    }

    setCachedSize(size)
    setMinimized(true)
    return setSize(Vector2(150, 24))
  }

  return (
    <div
      className="Draggable"
      style={{
        width: size.x,
        height: size.y,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
      // Prevent context menu because ew
      onContextMenu={(e) => e.preventDefault()}
    >
      <div id={id} className="ContextBar" style={{
        cursor: dragging ? 'grabbing' : 'grab'
      }}>
        <p>{(name ?? '---').toUpperCase()}</p>
        <div className="ContextBarButtons">
          <div className="ContextBarButton" onClick={minimizeOrExpand}>
            {
              minimized ? <Maximize /> : <Minimize />
            }
          </div>
        </div>
      </div>
      <div className="ScrollContainer">
        <div className="ContextBody" ref={ref}>
          {children}
        </div>
      </div>
      <div id={resizeId} className="ResizeZone" />
    </div>
  )
})

// Draggable Component
export const Draggable: FC<{
  children?: ReactNode;
  name?: string;
  startSize?: Vector2;
  startPosition?: Vector2;
  maxWidth?: number;
  maxHeight?: number;
  // ref?: React.LegacyRef<HTMLDivElement> | undefined;
}> = ({
  children,
  name,
  startSize,
  startPosition,
  maxWidth,
  maxHeight,
  // ref,
}) => {
  // Current size of the draggable object
  const [size, setSize] = useState(Vector2(
    // Use start width or 300
    startSize?.x ?? 300,
    // Use start height or 200
    startSize?.y ?? 200,
  ))
  // Current position of the draggable object
  const [pos, setPos] = useState(Vector2(
    // Use start position or put it in the top right
    startPosition?.x ?? window.innerWidth - size.x - 120,
    startPosition?.y ?? 24,
  ))

  // Whether we are currently dragging or not
  const [dragging, setDragging] = useState(false)
  // Whether we are currently resizing or not
  const [resizing, setResizing] = useState(false)

  // Cached resize offset from when resize is invoked
  const [rOffset, setROffset] = useState(Vector2.zero)
  // Cached position offset from when drag is invoked
  const [pOffset, setPOffset] = useState(Vector2.zero)
  // Window size cache variable for resize recalculations
  const [winCache, setWinCache] = useState(Vector2(
    window.innerWidth,
    window.innerHeight
  ))

  // Minimize state
  const [minimized, setMinimized] = useState(false)
  const [cachedSize, setCachedSize] = useState(size)

  // Identifier of the drag component.
  const id = useMemo(() => `DraggableAsset-${uuidv4()}`, [])
  // Identifier of the resize component.
  const resizeId = useMemo(() => `ResizePoint-${id}`, [id])

  // Effect for register/cleanup of event listeners on mount/unmount
  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onWindowResize)
    }
  }, [
    id,
    resizeId,
    size,
    pos, 
    dragging,
    resizing,
    pOffset,
    rOffset,
    winCache,
    maxWidth,
    maxHeight,
  ])

  // On global mouse down event
  function onMouseDown(event: MouseEvent) {
    // Get the targer element as an HTMLElement
    const elm = event.target as HTMLElement | null
    // We want to try to use the current element,
    // but in case they are clicking on inner contents
    // we also need to consider the parent element.
    // from my testing offsetParent seems to work.
    const ids = [elm?.id, elm?.offsetParent?.id]

    // Check if the action is a drag action
    const isDrag = ids.includes(id)
    // Check is the action is a resize action
    const isResize = ids.includes(resizeId)
    
    // If it is neither return.
    if (!isDrag && !isResize) return

    // Prevent default actions.
    event.preventDefault()

    // Calculate the position offsets for dragging
    // and resizing the component.
    const pOffsetX = event.clientX - pos.x
    const pOffsetY = pos.y - event.clientY
    setPOffset(Vector2(pOffsetX, pOffsetY))
    setROffset(Vector2(
      size.x - pOffsetX,
      size.y + pOffsetY
    ))

    // Depending on the action set the correct state.
    if (isResize)
      setResizing(true)
    else
      setDragging(true)
  }

  // On mouse up event a.k.a release
  function onMouseUp(event: MouseEvent) {
    // If we are resizing set resizing to false.
    if (resizing) {
      event.preventDefault()
      setResizing(false)
    // If we are dragging set dragging to false.
    } else if (dragging) {
      event.preventDefault()
      setDragging(false)
    }
  }

  // On mouse move event.
  function onMouseMove(event: MouseEvent) {
    // If we are currently resizing.
    if (resizing) {
      event.preventDefault()

      // Calculate the x and clamp it to specified parameters.
      const x = Math.Clamp(
        event.clientX - pos.x + rOffset.x,
        150,
        maxWidth ?? window.innerWidth
      )
      // Calculate y and clamp it to specified parameters.
      const y =  Math.Clamp(
        event.clientY - pos.y + rOffset.y,
        24,
        maxHeight ?? window.innerHeight
      )

      // If below this threshold we consider it collapsed
      if (x < 180 && y < 54) {
        setMinimized(true)
        setCachedSize(Vector2(
          // Use start width or 300
          startSize?.x ?? 300,
          // Use start height or 200
          startSize?.y ?? 200,
        ))
      } else setMinimized(false)

      // Set the size.
      setSize(Vector2(x, y))
    // Otherwise if dragging.
    } else if (dragging) {
      event.preventDefault()

      // Calculate the x point and clamp it to specified parameters.
      const x = Math.Clamp(event.clientX - pOffset.x, 0, window.innerWidth - size.x)
      // Calculate the y point and clamp it to specified parameters.
      const y = Math.Clamp(event.clientY + pOffset.y, 0, window.innerHeight - size.y)

      // Set the position.
      setPos(Vector2(x, y))
    }
  }

  // On the window changing size event.
  function onWindowResize(event: UIEvent) {
    // Calculate the relative offsets for the element to keep it in the samish position.
    const xOffset = winCache.x - window.innerWidth
    // const yOffset = window.innerHeight - winCache.y

    // Calculate the x point and clamp it to specified parameters.
    const x = Math.Clamp(pos.x - xOffset, 0, window.innerWidth - size.x)
    // Calculate the y point and clamp it to specified parameters.
    // const y = Math.Clamp(pos.y + yOffset, 0, window.innerHeight - size.y)
    const y = Math.Clamp(pos.y, 0, window.innerHeight - size.y)

    // Set new position.
    setPos(Vector2(x, y))
    // Update the window size cache.
    setWinCache(Vector2(window.innerWidth, window.innerHeight))
  }

  // Used for the minimize and expand functionality
  function minimizeOrExpand() {
    if (minimized) {
      setMinimized(false)

      // Ensure that it cannot clip outside window.
      const x = pos.x + cachedSize.x > window.innerWidth ? window.innerWidth - pos.x : cachedSize.x
      const y = pos.y + cachedSize.y > window.innerHeight ? window.innerHeight - pos.y : cachedSize.y

      return setSize(Vector2(x, y))
    }

    setCachedSize(size)
    setMinimized(true)
    return setSize(Vector2(150, 24))
  }

  return (
    <div
      className="Draggable"
      style={{
        width: size.x,
        height: size.y,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
      // Prevent context menu because ew
      onContextMenu={(e) => e.preventDefault()}
    >
      <div id={id} className="ContextBar" style={{
        cursor: dragging ? 'grabbing' : 'grab'
      }}>
        <p>{(name ?? '---').toUpperCase()}</p>
        <div className="ContextBarButtons">
          <div className="ContextBarButton" onClick={minimizeOrExpand}>
            {
              minimized ? <Maximize /> : <Minimize />
            }
          </div>
        </div>
      </div>
      <div className="ScrollContainer">
        <div className="ContextBody">
          {children}
        </div>
      </div>
      <div id={resizeId} className="ResizeZone" />
    </div>
  )
}
