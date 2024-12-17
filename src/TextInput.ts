import * as Hangul from 'hangul-js'

export type TextInputSettings = {
    font: string
    fontColor: string
    selectionFontColor: string
    selectionColor: string
    boxColor: string
    focusBoxColor: string
    underlineColor: string
    fontSize: number
    maxLength: number
    caretBlinkRate: number
    defaultValue: string
    placeHolder: string
    placeHolderColor: string
    type: 'text' | 'number' | 'password'
    passwordChar: '\u25CF' | '*'
    disabled: boolean
    disabledColor: string
    disabledFontColor: string
    disabledBorderColor: string
    bounds: { x: number; y: number; w: number }
    padding: { top: number; left: number; right: number; bottom: number }
    border: { top: number; left: number; right: number; bottom: number }
    focusBorder: { top: number; left: number; right: number; bottom: number }
    enterCallback: (event: KeyboardEvent) => void
    hoverCallback: (inOut: boolean) => void
    focusCallback: (inOut: boolean) => void
}

export class TextInput {
    private static DELIMITERS = new Set([
        ' ',
        ',',
        '.',
        ';',
        ':',
        '/',
        '[',
        ']',
        '-',
        '\\',
        '?',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        '!',
        '@',
        '+',
        '=',
        '|',
        '~',
        '`',
        '{',
        '}',
        '"',
        "'",
        '<',
        '>'
    ])
    private static KOREAN_TO_ENGLISH: Record<string, string> = {
        ㅁ: 'a',
        ㄴ: 's',
        ㅇ: 'd',
        ㄹ: 'f',
        ㅎ: 'g',
        ㅗ: 'h',
        ㅓ: 'j',
        ㅏ: 'k',
        ㅣ: 'l',
        ㅂ: 'q',
        ㅈ: 'w',
        ㄷ: 'e',
        ㄱ: 'r',
        ㅅ: 't',
        ㅛ: 'y',
        ㅕ: 'u',
        ㅑ: 'i',
        ㅐ: 'o',
        ㅔ: 'p',
        ㅋ: 'z',
        ㅌ: 'x',
        ㅊ: 'c',
        ㅍ: 'v',
        ㅠ: 'b',
        ㅜ: 'n',
        ㅡ: 'm',
        ㅃ: 'Q',
        ㅉ: 'W',
        ㄸ: 'E',
        ㄲ: 'R',
        ㅆ: 'T',
        o: 'ㅒ',
        p: 'ㅖ'
    }
    private static defaultSettings: TextInputSettings = {
        font: 'Apple SD Gothic Neo',
        fontColor: '#000',
        selectionFontColor: '#FFF',
        selectionColor: '#0D0577',
        boxColor: '#767676',
        focusBoxColor: '#000',
        underlineColor: '#000',
        fontSize: 13,
        maxLength: -1,
        caretBlinkRate: 0.5,
        defaultValue: '',
        placeHolder: '',
        placeHolderColor: 'rgb(111, 111, 111)',
        type: 'text',
        disabled: false,
        disabledColor: 'rgb(247, 247, 247)',
        disabledFontColor: '#545454',
        disabledBorderColor: 'rgb(204, 204, 204)',
        passwordChar: '\u25CF',
        bounds: {
            x: 0,
            y: 0,
            w: 100
        },
        padding: {
            top: 1,
            left: 1,
            right: 1,
            bottom: 2
        },
        border: {
            top: 1,
            left: 1,
            right: 1,
            bottom: 1
        },
        focusBorder: {
            top: 3,
            left: 3,
            right: 3,
            bottom: 3
        },
        enterCallback: (event: KeyboardEvent) => {},
        hoverCallback: (inOut: boolean) => {},
        focusCallback: (inOut: boolean) => {}
    }

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private value: string // 입력된 텍스트
    private selection: [number, number] // 선택 [시작, 끝] 위치
    private isFocused: boolean // 포커스 여부
    private selectionPos: number // 선택 시작 위치 (마우스 클릭할때만 사용)
    private blinkTimer: number // 커서 깜빡임 타이머
    private maxLength: number // 최대 글자 (-1인 경우 무한)
    private assemblePos: number
    private startPos: number // TODO: 텍스트내 보여줄 시작 위치
    private wasOver: boolean
    private settings: typeof TextInput.defaultSettings

    constructor(settings: Partial<TextInputSettings>, canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.settings = Object.assign({}, TextInput.defaultSettings, settings)
        this.value = this.settings.defaultValue
        this.selection = [0, 0]
        this.isFocused = false
        this.blinkTimer = 0
        this.maxLength = this.settings.maxLength
        this.resetSelectionPos()
        this.resetAssembleMode()
        this.startPos = 0
        this.wasOver = false

        document.addEventListener('keydown', this.onKeyDown.bind(this))
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true)
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), true)
        document.addEventListener('mouseup', this.onMouseUp.bind(this), true)
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this), true)
        this.canvas.addEventListener('copy', async (e) => this.onCopy.call(this, e))
        this.canvas.addEventListener('paste', async (e) => this.onPaste.call(this, e))
        this.canvas.addEventListener('cut', async (e) => this.onCut.call(this, e))
    }

    draw() {
        this.context.font = `${this.settings.fontSize}px ${this.settings.font}`
        this.context.textAlign = 'left'
        this.context.textBaseline = 'middle'

        const x = this.getStartX()
        const y = this.getStartY()
        const area = this.area()
        const textY = Math.round(y + Math.round(this.settings.fontSize / 2) + 1)

        this.context.save()
        this.context.beginPath()
        this.context.rect(area.x, area.y, area.w + 1, area.h + 1)
        this.context.clip()

        if (this.disabled) {
            this.context.fillStyle = this.settings.disabledColor
            this.context.fillRect(
                this.settings.bounds.x - this.settings.padding.left,
                this.settings.bounds.y - this.settings.padding.top,
                area.w,
                area.h
            )
        }

        if (this.isFocused) {
            if (this.isSelected()) {
                const selectOffset = this.measureText(
                    this.getSubText(0, Math.min(this.selection[0], this.selection[1]))
                )
                const selectWidth = this.measureText(this.getSelectionText())
                this.context.fillStyle = this.settings.selectionColor
                this.context.fillRect(selectOffset + x, y - 1, selectWidth, this.settings.fontSize + 3)
            } else {
                if (this.cursorBlink()) {
                    const cursorOffset = this.measureText(this.getSubText(0, this.selection[0]))
                    this.context.fillStyle = this.settings.fontColor
                    this.context.fillRect(cursorOffset + x, y, 1, this.settings.fontSize)
                }
            }
        }

        const [before, after] = this.getSelectionOutside()
        const selectionText = this.getSelectionText()
        const beforeValue = this.getDrawText(before)
        const selectionValue = this.getDrawText(selectionText)
        const afterValue = this.getDrawText(after)

        // before
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.fontColor
        this.context.fillText(beforeValue, x, textY)
        // selection
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.selectionFontColor
        this.context.fillText(selectionValue, x + this.measureText(before), textY)
        // after
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.fontColor
        this.context.fillText(afterValue, x + this.measureText(before + selectionText), textY)

        // draw placeholder
        if (this.isEmpty()) {
            this.context.fillStyle = this.settings.placeHolderColor
            this.context.fillText(this.settings.placeHolder, x, textY)
        }

        // draw underline to handle hangul assemble mode
        if (this.isFocused && this.isAssembleMode()) {
            this.drawUnderline()
        }

        this.drawRect(area.x, area.y, area.w, area.h)

        this.context.restore()
    }

    update(deltaTime: number) {
        this.blinkTimer += deltaTime
    }

    isSelected(): boolean {
        return this.selection[0] !== this.selection[1]
    }

    isEmpty(): boolean {
        return this.getLength() === 0
    }

    getLength(): number {
        return this.value.length
    }

    getMaxLength(): number {
        return this.settings.maxLength
    }

    set text(value: string) {
        this.value = value
    }

    get text(): string {
        return this.value
    }

    get focus(): boolean {
        return this.isFocused
    }

    set focus(value: boolean) {
        if (value && !this.disabled) {
            this.isFocused = true
            this.blinkTimer = this.settings.caretBlinkRate
            this.settings.focusCallback(true)
        } else {
            this.onStartOfSelection()
            this.resetAssembleMode()
            this.resetSelectionPos()
            this.isFocused = false
            this.settings.focusCallback(false)
        }
    }

    get disabled(): boolean {
        return this.settings.disabled
    }

    set disabled(value: boolean) {
        this.settings.disabled = value
        this.focus = false
    }

    get type(): 'text' | 'number' | 'password' {
        return this.settings.type
    }

    set type(value: 'text' | 'number' | 'password') {
        this.settings.type = value
        this.resetAssembleMode()
        this.onCancelOfSelectionEnd()
    }

    private moveSelection(position: number) {
        this.setSelection(position, position)
    }

    private setSelection(start: number, end: number) {
        start = this.clamp(start, 0, this.getLength())
        end = this.clamp(end, 0, this.getLength())

        this.selection[0] = start
        this.selection[1] = end
        this.blinkTimer = this.settings.caretBlinkRate
    }

    private at(i: number): string {
        return this.value[i]
    }

    private getDrawText(str: string): string {
        return this.type === 'password' ? this.settings.passwordChar.repeat(str.length) : str
    }

    private drawUnderline() {
        const x = this.getStartX()
        const y = this.getStartY() + this.settings.fontSize - 2
        this.context.fillStyle = this.settings.underlineColor
        const cursorOffset = this.measureText(this.getAssemblePosBefore())
        const singleCharWidth = this.measureText(this.getAssemblePosChar())
        this.context.fillRect(cursorOffset + x, y, singleCharWidth, 2)
    }

    private getStartX(): number {
        return this.settings.bounds.x + this.settings.padding.left + this.settings.border.left
    }

    private getStartY(): number {
        return this.settings.bounds.y + this.settings.padding.top + this.settings.border.top
    }

    private measureText(text: string): number {
        this.context.font = `${this.settings.fontSize}px ${this.settings.font}`
        this.context.textAlign = 'left'
        this.context.textBaseline = 'middle'
        return this.context.measureText(this.getDrawText(text)).width
    }

    private cursorBlink() {
        return Math.floor(this.blinkTimer / this.settings.caretBlinkRate) % 2
    }

    private getSelectionText(): string {
        return this.getSubText(this.selection[0], this.selection[1])
    }

    private getSubText(start: number, end: number) {
        return this.value.substring(start, end)
    }

    private extendSelection(start: number, end: number) {
        this.setSelection(start, end)
    }

    private moveRightBoundary() {
        // Clear the selection and move cursor to the right boundary of the selection
        const rightBoundary = Math.max(this.selection[0], this.selection[1])
        this.moveSelection(rightBoundary)
    }

    private moveLeftBoundary() {
        // Clear the selection and move cursor to the left boundary of the selection
        const leftBoundary = Math.min(this.selection[0], this.selection[1])
        this.moveSelection(leftBoundary)
    }

    private extendRightBoundary() {
        const rightBoundary = Math.min(this.selection[0], this.selection[1])
        this.extendSelection(rightBoundary, this.getLength())
    }

    private extendLeftBoundary() {
        const leftBoundary = Math.max(this.selection[0], this.selection[1])
        this.extendSelection(leftBoundary, 0)
    }

    private onRight(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault()
        const altKey = keyEvent.altKey
        const shiftKey = keyEvent.shiftKey
        const metaKey = keyEvent.metaKey
        const controlKey = keyEvent.ctrlKey
        this.resetAssembleMode()

        if (this.isSelected()) {
            if (shiftKey) {
                if (metaKey || controlKey) {
                    // Extend selection to the end of the text
                    this.extendRightBoundary()
                } else {
                    if (altKey) {
                        // Extend selection to the right by word
                        const nextCurPos = this.getStopWordRange(this.selection[1])[1]
                        this.extendSelection(this.selection[0], nextCurPos)
                    } else {
                        // Extend selection to the right by one character
                        this.extendSelection(this.selection[0], this.selection[1] + 1)
                    }
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the end of text
                    this.onEndOfSelection()
                } else {
                    this.moveRightBoundary()
                }
            }
            return
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getStopWordRange(this.selection[1])[1]

            if (shiftKey) {
                // If shift is pressed, extend the selection to the next word boundary
                this.extendSelection(this.selection[0], nextCurPos)
            } else {
                // Without shift, simply move the cursor
                this.moveSelection(nextCurPos)
            }
            return
        }

        // meta/control key is pressed
        if (metaKey || controlKey) {
            if (shiftKey) {
                this.extendSelection(this.selection[0], this.getLength())
            } else {
                // Move cursor to the end of the text
                this.onEndOfSelection()
            }
            return
        }

        // Move cursor to the right by one character
        if (shiftKey) {
            // Extend selection while holding the shift key
            this.extendSelection(this.selection[0], this.selection[1] + 1)
        } else {
            // Move cursor without extending selection
            this.moveSelection(this.selection[1] + 1)
        }
    }

    private onLeft(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault()
        const altKey = keyEvent.altKey
        const shiftKey = keyEvent.shiftKey
        const metaKey = keyEvent.metaKey
        const controlKey = keyEvent.ctrlKey
        this.resetAssembleMode()

        if (this.isSelected()) {
            if (shiftKey) {
                if (metaKey || controlKey) {
                    // Extend selection to the start of the text
                    this.extendLeftBoundary()
                } else {
                    if (altKey) {
                        // Extend selection to the left by word
                        const nextCurPos = this.getStopWordRange(this.selection[1] - 1)[0]
                        this.extendSelection(this.selection[0], nextCurPos)
                    } else {
                        // Extend selection to the left by one character
                        this.extendSelection(this.selection[0], this.selection[1] - 1)
                    }
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the beginning of text
                    this.onStartOfSelection()
                } else {
                    this.moveLeftBoundary()
                }
            }
            return
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getStopWordRange(this.selection[0] - 1)[0]

            if (shiftKey) {
                this.extendSelection(this.selection[1], nextCurPos)
            } else {
                // Without shift, simply move the cursor
                this.moveSelection(nextCurPos)
            }
            return
        }

        // meta/control key is pressed
        if (metaKey || controlKey) {
            if (shiftKey) {
                this.extendSelection(this.selection[1], 0)
            } else {
                // Move cursor to the start of the text
                this.onStartOfSelection()
            }
            return
        }

        // Move cursor to the left by one character
        if (shiftKey) {
            // Extend selection while holding the shift key
            this.extendSelection(this.selection[0], this.selection[1] - 1)
        } else {
            // Move cursor without extending selection
            this.moveSelection(this.selection[1] - 1)
        }
    }

    private onHome(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault()
        const shiftKey = keyEvent.shiftKey

        if (shiftKey) {
            const startPos = Math.max(this.selection[0], this.selection[1])
            this.extendSelection(startPos, 0)
        } else {
            this.onStartOfSelection()
        }
    }

    private onEnd(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault()
        const shiftKey = keyEvent.shiftKey

        if (shiftKey) {
            const startPos = Math.min(this.selection[0], this.selection[1])
            this.extendSelection(startPos, this.getLength())
        } else {
            this.onEndOfSelection()
        }
    }

    private onStartOfSelection() {
        this.moveSelection(0)
    }

    private onEndOfSelection() {
        this.moveSelection(this.getLength())
    }

    private onCancelOfSelectionStart() {
        this.moveSelection(this.selection[0])
    }

    private onCancelOfSelectionEnd() {
        this.moveSelection(this.selection[1])
    }

    private createClipboardEvent(type: 'copy' | 'paste' | 'cut'): ClipboardEvent {
        return new ClipboardEvent(type, { bubbles: true, cancelable: true, clipboardData: null })
    }

    private handleMetaInput(keyEvent: KeyboardEvent): boolean {
        const char = keyEvent.key
        const metaKey = keyEvent.metaKey

        // copy selection text
        if (metaKey && (char === 'c' || char === 'C' || char === 'ㅊ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('copy'))
            return true
        }

        // paste text
        if (metaKey && (char === 'v' || char === 'V' || char === 'ㅍ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('paste'))
            return true
        }

        // cut text
        if (metaKey && (char === 'x' || char === 'X' || char === 'ㅌ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('cut'))
            return true
        }

        // select all text
        if (metaKey && (char === 'a' || char === 'A' || char === 'ㅁ')) {
            keyEvent.preventDefault()
            this.selectAllText()
            return true
        }

        // refresh event
        if (metaKey && (char === 'r' || char === 'R' || char === 'ㄱ')) {
            return true
        }

        return false
    }

    private handleTypedText(keyEvent: KeyboardEvent) {
        const char = keyEvent.key

        if (this.handleMetaInput(keyEvent)) {
            return
        }

        // prevent missing meta key code
        if (char.length > 1) {
            return
        }

        this.appendValue(char)
    }

    private isMaxLengthOverflow(newValue: string = ''): boolean {
        if (this.maxLength === -1) return false
        return this.getLength() + newValue.length > this.maxLength
    }

    private isNumeric(value: string): boolean {
        return /^-?\d+$/.test(value)
    }

    private appendValue(value: string, resetAssemble: boolean = false) {
        if (this.type === 'number' && !this.isNumeric(value)) {
            return
        }

        const [before, after] = this.getSelectionOutside()

        if (this.isMaxLengthOverflow(value)) {
            // Calculate the remaining allowed length
            const remainingLength = this.settings.maxLength - (before.length + after.length)

            // Trim the value to fit within the remaining allowed length
            const newValue = value.substring(0, remainingLength)

            // Handle input as the non-Hangul only if there's still space
            if (newValue.length > 0) {
                this.handleNonHangul(before, newValue, after)
            }

            return
        }

        if (this.isHangul(value)) {
            // Handle Hangul input
            this.handleHangul(before, value, after)

            if (resetAssemble) {
                this.resetAssembleMode()
            }
        } else {
            // Handle non-Hangul input
            this.handleNonHangul(before, value, after)
        }

        // const totalWidth = this.measureText(this.value);
        // if (totalWidth > this.settings.bounds.x) {
        //     console.log('overflow!');
        // }
    }

    private handleHangul(beforeValue: string, newValue: string, afterValue: string) {
        if (this.type === 'password') {
            this.assembleHangul(beforeValue, this.convertKoreanToEnglish(newValue), afterValue)
            return
        }

        // assemble hangul according to current assemble mode
        if (this.isAssembleMode()) {
            this.assembleHangul(
                this.getAssemblePosBefore(),
                Hangul.a(Hangul.d(this.getAssemblePosChar() + newValue)),
                afterValue
            )
        } else {
            this.assembleHangul(beforeValue, Hangul.a(Hangul.d(newValue)), afterValue)
        }
    }

    private assembleHangul(beforeValue: string, newValue: string, afterValue: string) {
        this.text = beforeValue + newValue + afterValue
        const selectionPos = beforeValue.length + newValue.length
        this.moveSelection(selectionPos)
        this.setAssemblePos(selectionPos - 1)
    }

    private handleNonHangul(before: string, value: string, after: string) {
        const lastCurPos = before.length + value.length
        this.text = before + value + after
        this.moveSelection(lastCurPos)
        this.resetAssembleMode()
    }

    private onRemove(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault()

        const metaKey = keyEvent.metaKey

        if (this.isSelected()) {
            // If text is selected, remove the selected text
            const [before, after] = this.getSelectionOutside()
            this.text = before + after
            this.moveSelection(before.length)
            return
        }

        if (this.isAssembleMode() && !metaKey) {
            const before = this.getAssemblePosBefore()
            const disassembled = Hangul.d(this.getAssemblePosChar())
            const after = this.getAssemblePosAfter()
            const assembled = Hangul.a(disassembled.slice(0, -1))

            if (assembled === '') {
                this.resetAssembleMode()
            }

            const prefix = before + assembled
            this.text = prefix + after
            this.moveSelection(prefix.length)
            return
        }

        // If no text is selected, remove the character before the cursor
        const [before, after] = this.getSelectionOutside()
        const newBefore = before.slice(0, metaKey ? before.length * -1 : -1)
        this.text = newBefore + after
        this.moveSelection(newBefore.length)
    }

    private setAssemblePos(pos: number) {
        this.assemblePos = pos
    }

    private resetAssembleMode() {
        this.assemblePos = -1
    }

    private isAssembleMode(): boolean {
        return this.assemblePos !== -1
    }

    private isHangul(char: string): boolean {
        const code = char.charCodeAt(0)
        return (
            (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
            (code >= 0x3130 && code <= 0x318f) || // Hangul Compatibility Jamo
            (code >= 0xac00 && code <= 0xd7a3) // Hangul Syllables
        )
    }

    private isSelectionStart(): boolean {
        return this.selectionPos >= 0
    }

    private resetSelectionPos() {
        this.selectionPos = -1
    }

    private textPos(x: number, y: number) {
        const boundX = x - this.area().x
        let totalWidth = 0
        let pos = this.getLength()

        if (boundX < this.measureText(this.value)) {
            for (let i = 0; i < this.getLength(); i++) {
                totalWidth += this.measureText(this.at(i))
                if (totalWidth >= boundX) {
                    pos = i
                    break
                }
            }
        }

        return pos
    }

    private getMousePos(event: MouseEvent): { x: number; y: number } {
        const target = event.target as HTMLElement
        const rect = target.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        return { x, y }
    }

    // DOM Event Handler
    private onKeyDown(keyEvent: KeyboardEvent) {
        if (!this.isFocused) {
            return
        }
        const keyCode = keyEvent.key

        switch (keyCode) {
            case 'Meta':
            case 'Alt':
            case 'Shift':
            case 'Control':
            case 'Tab':
            case 'ArrowUp':
            case 'ArrowDown':
                break
            case 'Enter':
                this.settings.enterCallback(keyEvent)
                break
            case 'Backspace':
                this.onRemove(keyEvent)
                break
            case 'ArrowRight':
                this.onRight(keyEvent)
                break
            case 'ArrowLeft':
                this.onLeft(keyEvent)
                break
            case 'Escape':
                this.onCancelOfSelectionEnd()
                break
            case 'Home':
                this.onHome(keyEvent)
                break
            case 'End':
                this.onEnd(keyEvent)
                break
            case ' ':
                keyEvent.preventDefault()
            // Intentionally no break statement
            default:
                this.handleTypedText(keyEvent)
                break
        }
    }

    private onMouseMove(event: MouseEvent) {
        const mousePos = this.getMousePos(event)
        if (this.contains(mousePos.x, mousePos.y) && !this.disabled) {
            this.settings.hoverCallback(true)
            this.canvas.style.cursor = 'text'
            this.wasOver = true
        } else {
            this.settings.hoverCallback(false)
            if (this.wasOver) {
                this.canvas.style.cursor = 'default'
                this.wasOver = false
            }
        }

        if (!this.isFocused || !this.isSelectionStart()) {
            return
        }

        const curPos = this.textPos(mousePos.x, mousePos.y)
        const start = Math.min(this.selectionPos, curPos)
        const end = Math.max(this.selectionPos, curPos)

        this.extendSelection(start, end)
    }

    private onMouseDown(event: MouseEvent) {
        event.preventDefault()
        const leftButton = event.button === 0
        const mousePos = this.getMousePos(event)
        this.resetAssembleMode()

        if (leftButton && this.contains(mousePos.x, mousePos.y) && !this.disabled) {
            this.focus = true

            const curPos = this.textPos(mousePos.x, mousePos.y)

            if (event.detail === 3 && curPos >= this.selection[0] && curPos <= this.selection[1]) {
                this.selectAllText()
                return
            }

            this.moveSelection(curPos)
            this.selectionPos = curPos

            return
        }

        this.focus = false
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isFocused) {
            return
        }
        this.resetSelectionPos()
    }

    private onDoubleClick(event: MouseEvent) {
        if (!this.isFocused) {
            return
        }
        event.preventDefault()
        const leftButton = event.button === 0
        const mousePos = this.getMousePos(event)

        if (leftButton && this.contains(mousePos.x, mousePos.y)) {
            const curPos = this.textPos(mousePos.x, mousePos.y)
            const [start, end] = this.getStopWordRange(curPos)
            this.extendSelection(start, end)
        }
    }

    private async onCopy(event: ClipboardEvent) {
        if (!this.isFocused || this.type === 'password' || this.isEmpty()) return
        await navigator.clipboard.writeText(this.getSelectionText())
    }

    private async onPaste(event: ClipboardEvent) {
        if (!this.isFocused) return
        const text = await navigator.clipboard.readText()
        this.appendValue(text, true)
    }

    private async onCut(event: ClipboardEvent) {
        if (!this.isFocused || this.type === 'password' || this.isEmpty()) return
        await navigator.clipboard.writeText(this.getSelectionText())
        const [before, after] = this.getSelectionOutside()
        this.text = before + after
        this.moveSelection(before.length)
    }

    private getStopWordRange(pos: number): [number, number] {
        const startChar = this.at(pos)
        if (!startChar) return [pos, pos]
        const isDelimiterStart = TextInput.DELIMITERS.has(startChar)

        if (isDelimiterStart) {
            // Expand the range for consecutive *same-type* delimiters
            let start = pos
            let end = pos + 1
            while (start > 0 && TextInput.DELIMITERS.has(this.at(start - 1)) && this.at(start - 1) === startChar) {
                start--
            }
            while (end < this.getLength() && TextInput.DELIMITERS.has(this.at(end)) && this.at(end) === startChar) {
                end++
            }

            return [start, end]
        }

        // Iterate outward from `pos` in both directions
        let start = 0
        let end = this.getLength()
        const isNonAsciiStart = this.isHangul(startChar)

        for (let i = 1; i < this.getLength(); i++) {
            const left = pos - i
            const right = pos + i

            // Check the left side
            if (left >= 0 && start === 0 && this.getWordStopCondition(left, isNonAsciiStart)) {
                start = left + 1 // Start is after the delimiter
            }

            // Check the right side
            if (
                right < this.getLength() &&
                end === this.getLength() &&
                this.getWordStopCondition(right, isNonAsciiStart)
            ) {
                end = right
            }

            // Break early if both start and end are found
            if (start !== 0 && end !== this.getLength()) {
                break
            }
        }

        return [start, end]
    }

    private getWordStopCondition(i: number, isNonAsciiStart: boolean): boolean {
        // Stop condition for non-delimiter characters
        const char = this.at(i)
        return (
            TextInput.DELIMITERS.has(char) ||
            (isNonAsciiStart && !this.isHangul(char)) ||
            (!isNonAsciiStart && this.isHangul(char))
        )
    }

    selectAllText() {
        this.extendSelection(0, this.getLength())
        this.resetAssembleMode()
    }

    private getSelectionOutside(): [string, string] {
        const start = Math.min(this.selection[0], this.selection[1])
        const end = Math.max(this.selection[0], this.selection[1])
        const before = this.getSubText(0, start)
        const after = this.getSubText(end, this.getLength())
        return [before, after]
    }

    private getAssemblePosBefore(): string {
        return this.getSubText(0, this.assemblePos)
    }

    private getAssemblePosChar(): string {
        return this.getSubText(this.assemblePos, Math.min(this.assemblePos + 1, this.getLength()))
    }

    private getAssemblePosAfter(): string {
        return this.getSubText(Math.min(this.assemblePos + 1, this.getLength()), this.getLength())
    }

    area(): { x: number; y: number; w: number; h: number } {
        return {
            x: this.settings.bounds.x - this.settings.padding.left - this.settings.border.left,
            y: this.settings.bounds.y - this.settings.padding.top - this.settings.border.top,
            w: this.settings.bounds.w + this.settings.padding.right + this.settings.border.right,
            h: this.settings.fontSize + 4 + this.settings.padding.bottom + this.settings.border.bottom
        }
    }

    private contains(x: number, y: number): boolean {
        const area = this.area()
        return (
            x >= area.x && x <= this.settings.bounds.x + area.w && y >= area.y && y <= this.settings.bounds.y + area.h
        )
    }

    private drawRect(x: number, y: number, w: number, h: number) {
        this.context.beginPath()

        const edge = 1
        this.context.strokeStyle = this.isFocused
            ? this.settings.focusBoxColor
            : this.disabled
              ? this.settings.disabledBorderColor
              : this.settings.boxColor

        // left vertical line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.left : this.settings.border.left
        this.context.moveTo(x + 0.5, y + edge)
        this.context.lineTo(x + 0.5, y + h)

        // right vertical line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.right : this.settings.border.right
        this.context.moveTo(x + w + 0.5, y + edge)
        this.context.lineTo(x + w + 0.5, y + h)

        // top horizontal line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.top : this.settings.border.top
        this.context.moveTo(x + edge, y + 0.5)
        this.context.lineTo(x + w, y + 0.5)

        // bottom horizontal line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.bottom : this.settings.border.bottom
        this.context.moveTo(x + edge, y + h + 0.5)
        this.context.lineTo(x + w, y + h + 0.5)

        this.context.stroke()
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max)
    }

    private convertKoreanToEnglish(value: string): string {
        return TextInput.KOREAN_TO_ENGLISH[value] ?? value
    }
}
