export function keydownEvent(
    key: string,
    altKey: boolean = false,
    shiftKey: boolean = false,
    metaKey: boolean = false
) {
    const keyEvent = new KeyboardEvent('keydown', { key, altKey, shiftKey, metaKey })
    document.dispatchEvent(keyEvent)
}

export function clickEvent() {
    const mouseEvent = new MouseEvent('mousedown', { button: 0, detail: 1, clientX: 1, clientY: 1 })
    document.dispatchEvent(mouseEvent)
}

export function doubleClickEvent() {
    const mouseEvent = new MouseEvent('dblclick', { button: 0, clientX: 1, clientY: 1 })
    document.dispatchEvent(mouseEvent)
}

export function tripleClickEvent() {
    const mouseEvent = new MouseEvent('mousedown', { button: 0, detail: 3, clientX: 1, clientY: 1 })
    document.dispatchEvent(mouseEvent)
}

export function copyEvent(canvas: HTMLCanvasElement) {
    const keyEvent = new KeyboardEvent('keydown', { key: 'c', metaKey: true })
    canvas.dispatchEvent(keyEvent)
}

export function pasteEvent(canvas: HTMLCanvasElement) {
    const keyEvent = new KeyboardEvent('keydown', { key: 'v', metaKey: true })
    canvas.dispatchEvent(keyEvent)
}

export function cutEvent(canvas: HTMLCanvasElement) {
    const keyEvent = new KeyboardEvent('keydown', { key: 'x', metaKey: true })
    canvas.dispatchEvent(keyEvent)
}