import * as Hangul from 'hangul-js';

type TextInputSettings = {
    font: string,
    fontColor: string,
    selectionFontColor: string,
    cursorColor: string,
    selectionColor: string,
    boxColor: string,
    focusBoxColor: string,
    underlineColor: string,
    fontSize: number,
    maxLength: number,
    caretBlinkRate: number,
    defaultValue: string,
    placeHolder: string,
    placeHolderColor: string,
    type: 'text' | 'number' | 'password',
    bounds: { x: number, y: number, w: number },
    padding: { top: number, left: number, right: number, bottom: number },
    border: { top: number, left: number, right: number, bottom: number },
    enterCallback: (event: KeyboardEvent) => void,
    hoverCallback: (inOut: boolean) => void,
    focusCallback: (inOut: boolean) => void
};

function main() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    const showPasswordBtn = document.getElementById('show') as HTMLButtonElement;
    const inputs = [
        new TextInput({ bounds: { x: 10, y: 20, w: 300 }, maxLength: 8 }, canvas),
        new TextInput({ fontSize: 30, bounds: { x: 10, y: 50, w: 300 }, placeHolder: '한글을 입력해주세요' }, canvas),
        new TextInput({ bounds: { x: 10, y: 110, w: 300 }, type: 'number', placeHolder: '숫자', maxLength: 8 }, canvas),
        new TextInput({ bounds: { x: 10, y: 150, w: 300 }, type: 'password', placeHolder: '암호', maxLength: 15 }, canvas),
    ];
    showPasswordBtn.addEventListener('click', () => {
        const passwordInput = inputs[inputs.length - 1];
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPasswordBtn.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            showPasswordBtn.textContent = "Show";
        }
    });

    let lastTime = 0;
    function step(currentTime: DOMHighResTimeStamp) {
        const deltaTime = (currentTime - lastTime) / 1000;
        context.clearRect(0, 0, canvas.width, canvas.height);

        inputs.forEach((it) => it.update(deltaTime));
        inputs.forEach((it) => it.draw());
        inputs.forEach((it) => {
            const { x, y, w } = it.area();
            const maxLength = it.getMaxLength();

            if (maxLength === -1) return;

            context.font = `12px Monospaced`;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillStyle = 'gray';
            const text = `${maxLength - it.getLength() } remain`;
            const textW = context.measureText(text).width;
            context.fillText(text, x + w - textW, y - 7);
        });

        lastTime = currentTime;
        window.requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

class TextInput {
    private static DELIMITERS = new Set([' ', ',', '.', ';', ':', '/', '[', ']', '-', '\\', '?']);
    private static defaultSettings: TextInputSettings = {
        font: 'Apple SD Gothic Neo',
        fontColor: 'black',
        selectionFontColor: 'black',
        cursorColor: 'black',
        selectionColor: '#F5C4C6',
        boxColor: '#767676',
        focusBoxColor: '#E1797C',
        underlineColor: '#E1797C', 
        fontSize: 13,
        maxLength: -1,
        caretBlinkRate: 0.5,
        defaultValue: '',
        placeHolder: '',
        placeHolderColor: 'rgb(111, 111, 111)',
        type: 'text',
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
        enterCallback: (event: KeyboardEvent) => {},
        hoverCallback: (inOut: boolean) => {},
        focusCallback: (inOut: boolean) => {}
    };
    
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private value: string; // 입력된 텍스트
    private selection: [number, number]; // 선택 [시작, 끝] 위치
    private selectionDirection: -1 | 0 | 1;
    private isFocused: boolean; // 포커스 여부
    private selectionPos: number; // 선택 시작 위치 (마우스 클릭할때만 사용)
    private blinkTimer: number; // 커서 깜빡임 타이머
    private maxLength: number; // 최대 글자 (-1인 경우 무한)
    private assemblePos: number; // 조합중인 한글 위치
    private startPos: number; // 텍스트내 보여줄 시작 위치
    private settings: typeof TextInput.defaultSettings;

    constructor(settings: Partial<TextInputSettings>, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.settings = Object.assign({}, TextInput.defaultSettings, settings);
        this.value = this.settings.defaultValue;
        this.selection = [0, 0];
        this.selectionDirection = 0;
        this.isFocused = false;
        this.blinkTimer = 0;
        this.maxLength = this.settings.maxLength;
        this.resetSelectionPos();
        this.resetAssembleMode();
        this.startPos = 0;

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), true);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), true);
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this), true);
        this.canvas.addEventListener('copy', async (e) => this.onCopy.call(this, e));
        this.canvas.addEventListener('paste', async (e) => this.onPaste.call(this, e));
        this.canvas.addEventListener('cut', async (e) => this.onCut.call(this, e));
    }

    draw() {
        this.context.font = `${this.settings.fontSize}px ${this.settings.font}`;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';

        const x = this.getStartX();
        const y = this.getStartY();
        const area = this.area();
        const textY = Math.round(y + 1 + this.settings.fontSize / 2);

        this.context.save();
        this.context.beginPath();
        this.context.rect(area.x, area.y, area.w + 1, area.h + 1);
        this.context.clip();
        
        if (this.isFocused) {
            if (this.isSelected()) {
                const selectOffset = this.measureText(this.getSubText(0, this.selection[0]));
                const selectWidth = this.measureText(this.getSelectionText());
                this.context.fillStyle = this.settings.selectionColor;
                this.context.fillRect(selectOffset + x, y, selectWidth, this.settings.fontSize - 1);
            } else {
                if (this.cursorBlink()) {
                    const cursorOffset = this.measureText(this.getSubText(0, this.selection[0]));
                    this.context.fillStyle = this.settings.cursorColor;
                    this.context.fillRect(cursorOffset + x, y, 1, this.settings.fontSize);
                }
            }
        }

        const [before, after] = this.getSelectionOutside();
        const selectionText = this.getSelectionText();
        const beforeValue = this.getDrawText(before)
        const selectionValue = this.getDrawText(selectionText)
        const afterValue = this.getDrawText(after)

        // before
        this.context.fillStyle = this.settings.fontColor;
        this.context.fillText(beforeValue, x, textY);
        // selection
        this.context.fillStyle = this.settings.selectionFontColor;
        this.context.fillText(selectionValue, x + this.measureText(before), textY);
        // after
        this.context.fillStyle = this.settings.fontColor;
        this.context.fillText(afterValue, x + this.measureText(before + selectionText), textY);

        // draw placeholder
        if (this.isEmpty()) {
            this.context.fillStyle = this.settings.placeHolderColor;
            this.context.fillText(this.settings.placeHolder, x, textY);
        }

        // draw underline to handle hangul assemble mode
        if (this.isFocused && this.isAssembleMode()) {
            this.drawUnderline(this.assemblePos);
        }
        
        this.drawRect(area.x, area.y, area.w, area.h);

        this.context.restore();
    }

    private getDrawText(str: string): string {
        return this.getType() === 'password' ? '*'.repeat(str.length) : str
    }

    private getType(): 'text' | 'number' | 'password' {
        return this.settings.type;
    }

    update(deltaTime: number) {
        this.blinkTimer += deltaTime;
    }

    setText(text: string) {
        this.value = text;
    }

    getText(): string {
        return this.value;
    }

    setSelection(start: number, end: number) {
        start = this.clamp(start, 0, this.value.length);
        end = this.clamp(end, 0, this.value.length);

        this.selection[0] = start;
        this.selection[1] = end;
        this.blinkTimer = this.settings.caretBlinkRate;
    }

    setFocus(focus: boolean) {
        if (focus) {
            this.isFocused = true;
            this.blinkTimer = this.settings.caretBlinkRate;
            this.settings.focusCallback(true);
        } else {
            this.onStartOfSelection();
            this.resetAssembleMode();
            this.resetSelectionPos();
            this.isFocused = false;
            this.settings.focusCallback(false);
        }
    }

    isEmpty(): boolean {
        return this.getLength() === 0;
    }

    getLength(): number {
        return this.value.length;
    }

    getMaxLength(): number {
        return this.settings.maxLength;
    }

    get type(): 'text' | 'number' | 'password' {
        return this.settings.type;
    }
    
    set type(value: 'text' | 'number' | 'password') {
        this.settings.type = value;
        this.resetAssembleMode();
        this.onCancelOfSelectionEnd();
    }

    private drawUnderline(pos: number) {
        const x = this.getStartX();
        const y = this.getStartY() + this.settings.fontSize - 2;
        this.context.fillStyle = this.settings.underlineColor;
        const cursorOffset = this.measureText(this.getSubText(0, pos));
        const singleCharWidth = this.measureText(this.getSubText(pos, pos + 1));
        this.context.fillRect(cursorOffset + x, y, singleCharWidth, 2);
    }

    private getStartX(): number {
        return this.settings.bounds.x + this.settings.padding.left + this.settings.border.left;
    }

    private getStartY(): number {
        return this.settings.bounds.y + this.settings.padding.top + this.settings.border.top;
    }

    private measureText(text: string): number {
        this.context.font = `${this.settings.fontSize}px ${this.settings.font}`;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        return this.context.measureText(this.getDrawText(text)).width;
    }

    private cursorBlink() {
        return Math.floor(this.blinkTimer / this.settings.caretBlinkRate) % 2;
    }

    private getSelectionText(): string {
        return this.getSubText(this.selection[0], this.selection[1]);
    }

    private getSubText(start: number, end: number) {
        return this.value.substring(start, end);
    }

    private onRight(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault();
        const altKey = keyEvent.altKey;
        const shiftKey = keyEvent.shiftKey;
        const metaKey = keyEvent.metaKey;
        const controlKey = keyEvent.ctrlKey;
        this.resetAssembleMode();

        if (this.isSelected()) {
            if (shiftKey) {
                if (metaKey || controlKey) {
                    // Move selection to the end of the text if meta/control key is pressed
                    this.setSelection(this.selection[0], this.value.length);
                } else {
                     // Move selection to the right by one character
                    this.setSelection(this.selection[0], this.selection[1] + 1);
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the end of text
                    this.onEndOfSelection();
                } else {
                    // Clear the selection and move cursor to the right boundary of the selection
                    this.onCancelOfSelectionEnd();
                }
            }
            
            return;
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getNearestWordIndex(this.selection[1] + 1)[1];

            if (shiftKey) {
                // If shift is pressed, extend the selection to the next word boundary
                this.setSelection(this.selection[0], nextCurPos);
            } else {
                // Without shift, simply move the cursor
                this.setSelection(nextCurPos, nextCurPos);
            }
            return;
        }

        // Move cursor to the end of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            const nextCurPos = shiftKey ? this.selection[0] : this.value.length;
            this.setSelection(nextCurPos, this.value.length);
            return;
        }
        
        // Move cursor to the right by one character
        const nextCurPos = this.selection[1] + 1;
        if (shiftKey) {
            // Extend selection while holding the shift key
            this.setSelection(this.selection[0], nextCurPos);
        } else {
            // Move cursor without extending selection
            this.setSelection(nextCurPos, nextCurPos);
        }
    }

    private onLeft(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault();
        const altKey = keyEvent.altKey;
        const shiftKey = keyEvent.shiftKey;
        const metaKey = keyEvent.metaKey;
        const controlKey = keyEvent.ctrlKey;
        this.resetAssembleMode();

        if (this.isSelected()) {
            if (shiftKey) {
                if (metaKey || controlKey) {
                    // Move selection to the start of the text if meta/control key is pressed
                    this.setSelection(0, this.selection[1]);
                } else {
                    // Move selection to the left by one character
                    this.setSelection(this.selection[0], this.selection[1] - 1);
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the beginning of text
                    this.onStartOfSelection();
                } else {
                    // Clear the selection and move cursor to the left boundary of the selection
                    this.onCancelOfSelectionStart();
                }
            }
            
            return;
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getNearestWordIndex(this.selection[0] - 1)[0];
                
            if (shiftKey) {
                // If shift is pressed, extend the selection to the previous word boundary
                this.setSelection(nextCurPos, this.selection[1]);
            } else {
                // Without shift, simply move the cursor
                this.setSelection(nextCurPos, nextCurPos);
            }
            return;
        }

        // Move cursor to the start of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            const nextCurPos = shiftKey ? this.selection[1] : 0;
            this.setSelection(0, nextCurPos);
            return;
        }

        // Move cursor to the left by one character
        if (shiftKey) {
            // Extend selection while holding the shift key
            // TODO: BUGFIX
            this.setSelection(this.selection[0] - 1, this.selection[1]);
        } else {
            // Move cursor without extending selection
            const nextCurPos = this.selection[1] - 1;
            this.setSelection(nextCurPos, nextCurPos);
        }
    }

    private onStartOfSelection() {
        this.setSelection(0, 0);
    }

    private onEndOfSelection() {
        this.setSelection(this.value.length, this.value.length);
    }

    private onCancelOfSelectionStart() {
        this.setSelection(this.selection[0], this.selection[0]);
    }

    private onCancelOfSelectionEnd() {
        this.setSelection(this.selection[1], this.selection[1]);
    }

    private createClipboardEvent(type: 'copy' | 'paste' | 'cut'): ClipboardEvent {
        return new ClipboardEvent(type, { bubbles: true, cancelable: true, clipboardData: null });
    }

    private handleMetaInput(keyEvent: KeyboardEvent): boolean {
        const char = keyEvent.key;
        const metaKey = keyEvent.metaKey;

        // copy selection text
        if (metaKey && (char === 'c' || char === 'C' || char === 'ㅊ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('copy'));
            return true;
        }
        
        // paste text
        if (metaKey && (char === 'v' || char === 'V' || char === 'ㅍ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('paste'));
            return true;
        }

        // cut text
        if (metaKey && (char === 'x' || char === 'X' || char === 'ㅌ')) {
            this.canvas.dispatchEvent(this.createClipboardEvent('cut'));
            return true;
        }

        // select all text
        if (metaKey && (char === 'a' || char === 'A' || char === 'ㅁ')) {
            keyEvent.preventDefault();
            this.selectAllText();
            return true;
        }

        // refresh event
        if (metaKey && (char === 'r' || char === 'R' || char === 'ㄱ' )) {
            return true;
        }

        return false;
    }

    private handleTypedText(keyEvent: KeyboardEvent) {
        const char = keyEvent.key;

        if (this.handleMetaInput(keyEvent)) {
            return;
        }

        // prevent missing meta key code
        if (char.length > 1) {
            return;
        }

        this.appendValue(char);
    }

    private isMaxLengthOverflow(newValue: string = ''): boolean {
        if (this.maxLength === -1) return false;
        return this.value.length + newValue.length > this.maxLength;
    }

    private assembleHangul(beforeValue: string, newValue: string, afterValue: string) {
        this.setText(beforeValue + newValue + afterValue);
        const selectionPos = beforeValue.length + newValue.length;
        this.setSelection(selectionPos, selectionPos);
        this.setAssemblePos(selectionPos - 1);
    }

    private isNumeric(value: string): boolean {
        return /^-?\d+$/.test(value)
    }

    private appendValue(value: string, resetAssemble: boolean = false) {
        if (this.getType() === 'number' && !this.isNumeric(value)) {
            return;
        }

        const [before, after] = this.getSelectionOutside();

        if (this.isMaxLengthOverflow(value)) {
            // Calculate the remaining allowed length
            const remainingLength = this.settings.maxLength - (before.length + after.length);

            // Trim the value to fit within the remaining allowed length
            const newValue = value.substring(0, remainingLength);

            // Handle the non-Hangul part only if there's still space
            if (newValue.length > 0) {
                this.handleNonHangul(before, newValue, after);
            }

            return;
        }

        if (this.isHangul(value)) {
            // Handle Hangul input
            this.handleHangul(before, value, after);

            if (resetAssemble) {
                this.resetAssembleMode();
            }
        } else {
            // Handle non-Hangul input
            this.handleNonHangul(before, value, after);
        }

        // TODO: startPos 이동 구현
        // const totalWidth = this.measureText(this.value);
        // if (totalWidth > this.settings.bounds.x) {
        //     console.log('overflow!');
        // }
    }

    private handleHangul(before: string, value: string, after: string) {
        // assemble hangul according to current assemble mode
        if (this.isAssembleMode()) {
            this.assembleHangul("", Hangul.a(Hangul.d(before + value)), after);
        } else {
            this.assembleHangul(before, Hangul.a(Hangul.d(value)), after);
        }
    }

    private handleNonHangul(before: string, value: string, after: string) {
        const lastCurPos = before.length + value.length;
        this.setText(before + value + after);
        this.setSelection(lastCurPos, lastCurPos);
        this.resetAssembleMode();
    }

    private onRemove(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault();

        const metaKey = keyEvent.metaKey;

        if (this.isSelected()) {
            // If text is selected, remove the selected text
            const [before, after] = this.getSelectionOutside();
            this.setText(before + after);
            this.setSelection(before.length, before.length);
            return;
        }

        if (this.isAssembleMode() && !metaKey) {
            const before = this.getAssemblePosBefore();
            const disassembled = Hangul.d(this.getAssemblePosChar());
            const after = this.getAssemblePosAfter();
            const sliced = disassembled.slice(0, -1);
            const assembled = Hangul.a(sliced);

            if (assembled === '') {
                this.resetAssembleMode();
            }

            const prefix = before + assembled;
            this.setText(prefix + after);
            this.setSelection(prefix.length, prefix.length);
            return;
        }

        // If no text is selected, remove the character before the cursor
        const [before, after] = this.getSelectionOutside();
        const newBefore = before.slice(0, metaKey ? before.length * -1 : -1);
        this.setText(newBefore + after);
        this.setSelection(newBefore.length, newBefore.length);
    }

    private setAssemblePos(pos: number) {
        this.assemblePos = pos;
    }

    private resetAssembleMode() {
        this.assemblePos = -1;
    }

    private isAssembleMode(): boolean {
        return this.assemblePos !== -1;
    }

    private isHangul(char: string): boolean {
        const code = char.charCodeAt(0);
        return (
          (code >= 0x1100 && code <= 0x11FF) || // Hangul Jamo
          (code >= 0x3130 && code <= 0x318F) || // Hangul Compatibility Jamo
          (code >= 0xAC00 && code <= 0xD7A3)    // Hangul Syllables
        );
    }

    private isSelectionStart(): boolean {
        return this.selectionPos >= 0;
    }

    private resetSelectionPos() {
        this.selectionPos = -1;
    }

    private textPos(x: number, y: number) {
        const boundX = x - this.area().x;
        let totalWidth = 0;
        let pos = this.value.length;

        if (boundX < this.measureText(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                totalWidth += this.measureText(this.value[i]);
                if (totalWidth >= boundX) {
                    pos = i;
                    break;
                }
            }
        }

        return pos;
    }

    private getMousePos(event: MouseEvent): { x: number, y: number } {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return { x, y }
    }

    // DOM Event Handler
    private onKeyDown(keyEvent: KeyboardEvent) {
        if (!this.isFocused) {
            return;
        }
        const keyCode = keyEvent.key;

        switch (keyCode) {
            case 'Meta':
            case 'Alt':
            case 'Shift':
            case 'Control':
            case 'Tab':
            case 'ArrowUp':
            case 'ArrowDown':
                break;
            case 'Enter':
                this.settings.enterCallback(keyEvent);
                break;
            case 'Backspace':
                this.onRemove(keyEvent);
                break;
            case 'ArrowRight':
                this.onRight(keyEvent);
                break;
            case 'ArrowLeft':
                this.onLeft(keyEvent);
                break;
            case 'Escape':
                this.onCancelOfSelectionEnd();
                break;
            case 'Home':
                this.onStartOfSelection();
                break;
            case 'End':
                keyEvent.preventDefault();
                this.onEndOfSelection();
                break;
            case ' ':
                keyEvent.preventDefault();
                // Intentionally no break statement
            default: 
                this.handleTypedText(keyEvent);
                break;
        }
    }

    private onMouseMove(event: MouseEvent) {
        const mousePos = this.getMousePos(event);
        if (this.contains(mousePos.x, mousePos.y)) {
            this.settings.hoverCallback(true);
        } else {
            this.settings.hoverCallback(false);
        }
            
        if (!this.isFocused || !this.isSelectionStart()) {
            return
        }

        const curPos = this.textPos(mousePos.x, mousePos.y);
        const start = Math.min(this.selectionPos, curPos);
        const end = Math.max(this.selectionPos, curPos);

        this.setSelection(start, end);
    }

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
        const leftButton = event.button === 0;
        const mousePos = this.getMousePos(event);
        this.resetAssembleMode();

        if (leftButton && this.contains(mousePos.x, mousePos.y)) {
            this.setFocus(true);

            const curPos = this.textPos(mousePos.x, mousePos.y);

            if (event.detail === 3 && curPos >= this.selection[0] && curPos <= this.selection[1]) {
                this.selectAllText();
                return;
            }

            this.setSelection(curPos, curPos);
            this.selectionPos = curPos;

            return;
        }

        this.setFocus(false);
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isFocused) {
            return;
        }
        this.resetSelectionPos();
    }

    private onDoubleClick(event: MouseEvent) {
        if (!this.isFocused) {
            return;
        }
        event.preventDefault();
        const leftButton = event.button === 0;
        const mousePos = this.getMousePos(event);

        if (leftButton && this.contains(mousePos.x, mousePos.y)) {
            const curPos = this.textPos(mousePos.x, mousePos.y);
            const [start, end] = this.getNearestWordIndex(curPos);
            this.setSelection(start, end);
        }
    }

    private async onCopy(event: ClipboardEvent) {
        if (!this.isFocused || this.getType() === 'password' || this.isEmpty()) return;
        await navigator.clipboard.writeText(this.getSelectionText());
    }

    private async onPaste(event: ClipboardEvent) {
        if (!this.isFocused) return;
        const text = await navigator.clipboard.readText()
        this.appendValue(text, true);
    }

    private async onCut(event: ClipboardEvent) {
        if (!this.isFocused || this.getType() === 'password' || this.isEmpty()) return;
        await navigator.clipboard.writeText(this.getSelectionText());
        const [before, after] = this.getSelectionOutside();
        this.setText(before + after);
        this.setSelection(before.length, before.length);
    }

    private getNearestWordIndex(pos: number): [number, number] {
        // TODO: bugfix when alt + (left | right) cursor move start/end position
        let start = 0;
        let end = this.value.length;

        for (let i = pos - 1; i > 0; i--) {
            if (TextInput.DELIMITERS.has(this.value[i])) {
                start = i + 1; // Start is after the delimiter
                break;
            }
        }

        for (let i = pos + 1; i < this.value.length; i++) {
            if (TextInput.DELIMITERS.has(this.value[i])) {
                end = i;
                break;
            }
        }

        return [start, end];
    }

    private isSelected(): boolean {
        return this.selection[0] !== this.selection[1];
    }

    private selectAllText() {
        this.setSelection(0, this.value.length);
        this.resetAssembleMode();
    }

    private getSelectionOutside(): [string, string] {
        const start = Math.min(this.selection[0], this.selection[1]);
        const end = Math.max(this.selection[0], this.selection[1]);
        const before = this.getSubText(0, start);
        const after = this.getSubText(end, this.value.length);
        return [before, after];
    }

    private getAssemblePosBefore(): string {
        return this.getSubText(0, this.assemblePos);
    }

    private getAssemblePosChar(): string {
        return this.getSubText(this.assemblePos, Math.min(this.assemblePos + 1, this.value.length));
    }

    private getAssemblePosAfter(): string {
        return this.getSubText(Math.min(this.assemblePos + 1, this.value.length), this.value.length);
    }

    area(): { x: number, y: number, w: number, h: number } {
        return {
            x: this.settings.bounds.x - this.settings.padding.left - this.settings.border.left,
            y: this.settings.bounds.y - this.settings.padding.top - this.settings.border.top,
            w: this.settings.bounds.w + this.settings.padding.right + this.settings.border.right,
            h: this.settings.fontSize + 4 + this.settings.padding.bottom + this.settings.border.bottom
        }
    }

    private contains(x: number, y: number): boolean {
        const area = this.area();
        return x >= area.x &&
            x <= (this.settings.bounds.x + area.w) &&
            y >= area.y &&
            y <= (this.settings.bounds.y + area.h);
    }

    private drawRect(x: number, y: number, w: number, h: number) {
        this.context.beginPath();
    
        const edge = 1;
        this.context.strokeStyle = this.isFocused ? this.settings.focusBoxColor : this.settings.boxColor;

        // left vertical line
        this.context.lineWidth = this.isFocused ? 2 : this.settings.border.left;
        this.context.moveTo(x + 0.5, y+ edge);
        this.context.lineTo(x + 0.5, y + h);
    
        // right vertical line
        this.context.lineWidth = this.isFocused ? 2 : this.settings.border.right;
        this.context.moveTo(x + w + 0.5, y+ edge);
        this.context.lineTo(x + w + 0.5, y + h);
    
        // top horizontal line
        this.context.lineWidth = this.isFocused ? 2 : this.settings.border.top;
        this.context.moveTo(x+ edge, y + 0.5);
        this.context.lineTo(x + w, y + 0.5);
    
        // bottom horizontal line
        this.context.lineWidth = this.isFocused ? 2 : this.settings.border.bottom;
        this.context.moveTo(x + edge, y + h + 0.5);
        this.context.lineTo(x + w, y + h + 0.5);
    
        this.context.stroke();
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}

document.addEventListener("DOMContentLoaded", main);