import * as Hangul from 'hangul-js';

function main() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    const inputs = [
        new TextInput(200, 300, 74, 8, 13, canvas, context),
        new TextInput(200, 500, 300, -1, 30, canvas, context)
    ];

    let lastTime = 0;
    function step(currentTime: DOMHighResTimeStamp) {
        const deltaTime = (currentTime - lastTime) / 1000;
        context.clearRect(0, 0, canvas.width, canvas.height);

        inputs.forEach(it => it.update(deltaTime));
        inputs.forEach(it => it.draw());

        lastTime = currentTime;
        window.requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

class Vec2 {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x
    }

    get y(): number {
        return this._y
    }
}

class TextInput {
    private static DELIMITERS = new Set([' ', ',', '.', ';', ':', '/', '[', ']', '-', '\\', '?']);
    private static CURSOR_X_OFFSET = 3;
    
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private value: string; // 입력된 텍스트
    private selection: [number, number]; // 선택 [시작, 끝] 위치
    private isFocused: boolean; // 포커스 여부
    private selectionPos: number; // 선택 시작 위치 (마우스 클릭할때만 사용)
    private position: Vec2; // 위치
    private size: Vec2; // 크기
    private blinkTimer: number; // 커서 깜빡임 타이머
    private maxLength: number; // 최대 글자 (-1인 경우 무한)
    private fontSize: number; // 폰트 크기
    private assemblePos: number; // 조합중인 한글 위치
    private startPos: number; // 텍스트내 보여줄 시작 위치

    constructor(x: number, y: number, w: number, maxLength: number, fontSize: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;
        this.value = '';
        this.selection = [0, 0];
        this.isFocused = false;
        this.position = new Vec2(x, y);
        this.fontSize = fontSize;
        this.size = new Vec2(w, this.fontSize + 4);
        this.blinkTimer = 0;
        this.maxLength = maxLength;
        this.resetSelectionPos();
        this.resetAssembleMode();
        this.startPos = 0;

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), true);
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), true);
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this), true);
        this.canvas.addEventListener('copy', this.onCopy.bind(this));
        this.canvas.addEventListener('paste', this.onPaste.bind(this));
        this.canvas.addEventListener('cut', this.onCut.bind(this));
    }

    draw() {
        this.context.font = `${this.fontSize}px monospace`;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = 'black';

        const x = this.position.x + TextInput.CURSOR_X_OFFSET;
        const y = this.position.y + 3;

        this.context.save();
        this.context.beginPath();
        this.context.rect(this.position.x, this.position.y, this.size.x + 1, this.size.y + 1);
        this.context.clip();
        
        if (this.isFocused) {
            if (this.isSelected()) {
                const selectOffset = this.measureText(this.value.substring(0, this.selection[0]));
                const selectWidth = this.measureText(this.getSelectionText());
                this.context.fillStyle = '#F5C4C6';
                this.context.fillRect(selectOffset + x, y, selectWidth, this.fontSize - 1);
            } else {
                if (this.cursorBlink()) {
                    const cursorOffset = this.measureText(this.value.substring(0, this.selection[0]));
                    this.context.fillRect(cursorOffset + x, y, 1, this.fontSize);
                }
            }
        }

        const textY = Math.round(y + 1 + this.fontSize / 2);
        const [before, after] = this.getSelectionOutside();
        const selectionText = this.value.substring(this.selection[0], this.selection[1]);
        // before
        this.context.fillStyle = 'black';
        this.context.fillText(before, x, textY);
        // selection
        this.context.fillStyle = 'black';
        this.context.fillText(selectionText, x + this.measureText(before), textY);
        // after
        this.context.fillStyle = 'black';
        this.context.fillText(after, x + this.measureText(before + selectionText), textY);

        if (this.isFocused && this.isAssembleMode()) {
            this.drawUnderline(this.assemblePos);
        }
        
        this.drawRect(this.position.x, this.position.y, this.size.x, this.size.y);

        this.context.restore();
    }

    private drawUnderline(pos: number) {
        const x = this.position.x + TextInput.CURSOR_X_OFFSET;
        const y = this.position.y + this.fontSize;
        this.context.fillStyle = '#E1797C';
        const cursorOffset = this.measureText(this.value.substring(0, pos));
        const singleCharWidth = this.measureText(this.value.substring(pos, pos + 1));
        this.context.fillRect(cursorOffset + x, y, singleCharWidth, 2);
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

    private measureText(text: string): number {
        this.context.font = `${this.fontSize}px monospace`;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        return this.context.measureText(text).width;
    }

    private cursorBlink() {
        return Math.floor(this.blinkTimer / 0.5) % 2;
    }

    private onCopy(event: ClipboardEvent) {
        event.preventDefault();
        event.clipboardData.setData("text/plain", this.getSelectionText());
        console.log(this.getSelectionText());
    }

    private onPaste(event: ClipboardEvent) {
        event.preventDefault();
        this.appendValue(event.clipboardData.getData('text'));
    }

    private onCut(event: ClipboardEvent) {
        event.preventDefault();
        event.clipboardData.setData('text/plain', this.getSelectionText());
        const [before, after] = this.getSelectionOutside();
        this.setText(before + after);
        this.setSelection(before.length, before.length);
    }

    private getSelectionText(): string {
        return this.value.substring(this.selection[0], this.selection[1]);
    }

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
            case 'Enter':
            case 'ArrowUp':
            case 'ArrowDown':
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
                this.onExitSelection(keyEvent);
                break;
            default: 
                this.handleTypedText(keyEvent);
                break;
        }
    }

    private onExitSelection(keyEvent: KeyboardEvent) {
        this.setSelection(this.selection[1], this.selection[1]);
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
                    this.setSelection(this.value.length, this.value.length);
                } else {
                    // Clear the selection and move cursor to the right boundary of the selection
                    this.setSelection(this.selection[1], this.selection[1]);
                }
            }
            
            return;
        }

        if (altKey) {
            // TODO: shift 고려할것
            const nextCurPos = this.getNearestTermIndex(this.selection[1] + 1)[1];
            this.setSelection(nextCurPos, nextCurPos);
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
                    this.setSelection(0, 0);
                } else {
                    // Clear the selection and move cursor to the left boundary of the selection
                    this.setSelection(this.selection[0], this.selection[0]);
                }
            }
            
            return;
        }

        if (altKey) {
            // TODO: shift 고려할것
            const nextCurPos = this.getNearestTermIndex(this.selection[0] - 1)[0];
            this.setSelection(nextCurPos, nextCurPos);
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

    private handleMetaInput(keyEvent: KeyboardEvent): boolean {
        const char = keyEvent.key;
        const metaKey = keyEvent.metaKey;

        // TODO: copy, paste, cut 버그 수정
        // copy selection text
        if (metaKey && (char === 'c' || char === 'C' || char === 'ㅊ')) {
            this.canvas.dispatchEvent(new ClipboardEvent('copy', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return true;
        }
        
        // paste text
        if (metaKey && (char === 'v' || char === 'V' || char === 'ㅍ')) {
            this.canvas.dispatchEvent(new ClipboardEvent('paste', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return true;
        }

        // cut text
        if (metaKey && (char === 'x' || char === 'X' || char === 'ㅌ')) {
            this.canvas.dispatchEvent(new ClipboardEvent('cut', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return true;
        }

        // select all text
        if (metaKey && (char === 'a' || char === 'A' || char === 'ㅁ')) {
            this.selectAllText();
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

        if (!this.isMaxLengthOverflow()) {
            this.appendValue(char);   
        }
    }

    private isMaxLengthOverflow(): boolean {
        if (this.maxLength === -1) return false;
        return this.value.length >= this.maxLength;
    }

    private appendValue(value: string) {
        const [before, after] = this.getSelectionOutside();

        if (this.isHangul(value)) {
            // Handle Hangul input
            const newValue = Hangul.a(Hangul.d(before + value));
            this.setText(newValue + after);
            this.setSelection(newValue.length, newValue.length);
            this.setAssemblePos(newValue.length - 1);
        } else {
            // Handle non-Hangul input
            const lastCurPos = before.length + value.length;
            this.setText(before + value + after);
            this.setSelection(lastCurPos, lastCurPos);
            this.resetAssembleMode();
        }
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

        if (this.isAssembleMode()) {
            const before = this.getAssemblePosBefore();
            const disassembled = Hangul.d(this.getAssemblePosChar());
            const after = this.getAssemblePosAfter();
            const sliced = disassembled.slice(0, metaKey ? this.value.length * -1 : -1);
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

    private onMouseMove(event: MouseEvent) {
        const mousePos = this.getMousePos(event);
        if (this.contains(mousePos.x, mousePos.y)) {
            this.canvas.style.cursor = 'text';
        } else {
            this.canvas.style.cursor = 'default';
        }
            
        if (!this.isFocused || !this.isSelectionStart()) {
            return
        }

        const curPos = this.textPos(mousePos.x, mousePos.y);
        const start = Math.min(this.selectionPos, curPos);
        const end = Math.max(this.selectionPos, curPos);

        this.setSelection(start, end);
    }

    private isSelectionStart(): boolean {
        return this.selectionPos >= 0;
    }

    private resetSelectionPos() {
        this.selectionPos = -1;
    }

    private textPos(x: number, y: number) {
        const boundX = x - (this.position.x - TextInput.CURSOR_X_OFFSET);
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
            const [start, end] = this.getNearestTermIndex(curPos);
            this.setSelection(start, end);
        }
    }

    getNearestTermIndex(pos: number): [number, number] {
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
    }

    setSelection(start: number, end: number) {
        start = this.clamp(start, 0, this.value.length);
        end = this.clamp(end, 0, this.value.length);

        this.selection[0] = start;
        this.selection[1] = end;
        this.blinkTimer = 0.5;
    }

    private getSelectionOutside(): [string, string] {
        const start = Math.min(this.selection[0], this.selection[1]);
        const end = Math.max(this.selection[0], this.selection[1]);
        const before = this.value.substring(0, start);
        const after = this.value.substring(end, this.value.length);
        return [before, after];
    }

    private getAssemblePosBefore(): string {
        return this.value.substring(0, this.assemblePos);
    }

    private getAssemblePosChar(): string {
        return this.value.substring(this.assemblePos, Math.min(this.assemblePos + 1, this.value.length));
    }

    private getAssemblePosAfter(): string {
        return this.value.substring(Math.min(this.assemblePos + 1, this.value.length), this.value.length);
    }

    setFocus(focus: boolean) {
        if (focus) {
            this.isFocused = true;
            this.blinkTimer = 0.5;
        } else {
            this.setSelection(0, 0);
            this.isFocused = false;
        }
    }

    private contains(x: number, y: number) {
        return x >= this.position.x &&
            x <= (this.position.x + this.size.x) &&
            y >= this.position.y &&
            y <= (this.position.y + this.size.y);
    }

    private drawRect(x: number, y: number, w: number, h: number) {
        this.context.beginPath();
    
        const edge = 1;
        this.context.strokeStyle = this.isFocused ? '#E1797C' : '#767676';

        // left vertical line
        this.context.lineWidth = this.isFocused ? 2 : 1;
        this.context.moveTo(x + 0.5, y+ edge);
        this.context.lineTo(x + 0.5, y + h);
    
        // right vertical line
        this.context.lineWidth = this.isFocused ? 2 : 1;
        this.context.moveTo(x + w + 0.5, y+ edge);
        this.context.lineTo(x + w + 0.5, y + h);
    
        // top horizontal line
        this.context.lineWidth = this.isFocused ? 2 : 1;
        this.context.moveTo(x+ edge, y + 0.5);
        this.context.lineTo(x + w, y + 0.5);
    
        // bottom horizontal line
        this.context.lineWidth = this.isFocused ? 2 : 1;
        this.context.moveTo(x + edge, y + h + 0.5);
        this.context.lineTo(x + w, y + h + 0.5);
    
        this.context.stroke();
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}

document.addEventListener("DOMContentLoaded", main);