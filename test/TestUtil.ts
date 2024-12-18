export function keydownEvent(key: string, altKey: boolean = false, shiftKey: boolean = false, metaKey: boolean = false) {
    const keyEvent = new KeyboardEvent('keydown', { key, altKey, shiftKey, metaKey })
    document.dispatchEvent(keyEvent)
}