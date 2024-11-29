import * as Hangul from 'hangul-js';

function main() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    const inputs = [
        new TextInput(200, 300, 74, 8, 13, canvas, context),
        new TextInput(200, 500, 300, 15, 30, canvas, context)
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
    private value: string;
    private selection: [number, number];
    private isFocused: boolean;
    private selectionStart: number;
    private position: Vec2;
    private size: Vec2;
    private blinkTimer: number;
    private maxLength: number;
    private fontSize: number;

    constructor(x: number, y: number, w: number, maxLength: number, fontSize: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;
        this.value = '';
        this.selection = [0, 0];
        this.isFocused = false;
        this.selectionStart = -1;
        this.position = new Vec2(x, y);
        this.fontSize = fontSize;
        this.size = new Vec2(w, this.fontSize + 4);
        this.blinkTimer = 0;
        this.maxLength = maxLength;

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
        
        if (this.isFocused) {
            if (this.isSelected()) {
                const selectOffset = this.measureText(this.value.substring(0, this.selection[0]));
                const selectWidth = this.measureText(this.getSelectionText());

                this.context.fillStyle = '#F5C4C6';
                this.context.fillRect(selectOffset + x, y, selectWidth, this.fontSize - 1);
            } else {
                if (Math.floor(this.blinkTimer / 0.5) % 2) {
                    const cursorOffset = this.measureText(this.value.substring(0, this.selection[0]));
                    this.context.fillRect(cursorOffset + x, y, 1, this.fontSize);
                }
            }
        }

        const textY = Math.round(y + this.fontSize / 2);
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
        
        this.drawRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }

    update(deltaTime: number) {
        this.blinkTimer += deltaTime;
    }

    private measureText(text: string) {
        this.context.font = `${this.fontSize}px monospace`;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        return this.context.measureText(text).width;
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
        this.value = before + after;
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
        // const altKey = keyEvent.altKey;
        const shiftKey = keyEvent.shiftKey;
        const metaKey = keyEvent.metaKey;
        const controlKey = keyEvent.ctrlKey;

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

        // Move cursor to the end of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            this.setSelection(
                shiftKey ? this.selection[0] : this.value.length,
                this.value.length
            );
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
        const shiftKey = keyEvent.shiftKey;
        const metaKey = keyEvent.metaKey;
        const controlKey = keyEvent.ctrlKey;

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

        // Move cursor to the start of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            // TODO: getNearestTermIndex 사용하여 커서 위치 이동 조절
            this.setSelection(0, shiftKey ? this.selection[1] : 0);
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

    private handleTypedText(keyEvent: KeyboardEvent) {
        const char = keyEvent.key;
        const metaKey = keyEvent.metaKey;

        // TODO: copy, paste, cut 버그 수정

        // copy selection text
        if (metaKey && (char === 'c')) {
            this.canvas.dispatchEvent(new ClipboardEvent('copy', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return;
        }
        
        // paste text
        if (metaKey && (char === 'v')) {
            this.canvas.dispatchEvent(new ClipboardEvent('paste', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return;
        }

        // cut text
        if (metaKey && (char === 'x')) {
            this.canvas.dispatchEvent(new ClipboardEvent('cut', {
                bubbles: true, // Allows the event to bubble up the DOM
                cancelable: true, // Allows the event to be canceled
                clipboardData: new DataTransfer(), // Clipboard data for the event
            }));
            return;
        }

        // select all text
        if (metaKey && (char === 'a' || char === 'A' || char === 'ㅁ')) {
            this.selectAllText();
            return;
        }

        if (char.length > 1) {
            return;
        }

        if (this.value.length < this.maxLength) {
            this.appendValue(char);   
        }
    }

    private appendValue(value: string) {
        const [before, after] = this.getSelectionOutside();

        if (this.isHangul(value)) {
            // Handle Hangul input
            const newValue = Hangul.a(Hangul.d(before + value));
            this.value = newValue + after;
            this.setSelection(newValue.length, newValue.length);
        } else {
            // Handle non-Hangul input
            const lastCurPos = before.length + value.length;
            this.value = before + value + after;
            this.setSelection(lastCurPos, lastCurPos);
        }
    }

    private onRemove(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault();

        const metaKey = keyEvent.metaKey;

        if (this.isSelected()) {
            // If text is selected, remove the selected text
            const [before, after] = this.getSelectionOutside();
            this.value = before + after;
            this.setSelection(before.length, before.length);
            return;
        }

        // TODO: 한글 분해후 지우기 기능 추가

        // If no text is selected, remove the character before the cursor
        const [before, after] = this.getSelectionOutside();
        const newBefore = before.slice(0, metaKey ? before.length * -1 : -1);
        this.value = newBefore + after;
        this.setSelection(newBefore.length, newBefore.length);
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
            
        if (!this.isFocused || this.selectionStart < 0) {
            return
        }

        const curPos = this.textPos(mousePos.x, mousePos.y);
        const start = Math.min(this.selectionStart, curPos);
        const end = Math.max(this.selectionStart, curPos);

        this.setSelection(start, end);
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

        if (leftButton && this.contains(mousePos.x, mousePos.y)) {
            this.setFocus(true);

            const curPos = this.textPos(mousePos.x, mousePos.y);

            if (event.detail === 3 && curPos >= this.selection[0] && curPos <= this.selection[1]) {
                this.selectAllText();
                return;
            }

            this.setSelection(curPos, curPos);
            this.selectionStart = curPos;

            return;
        }

        this.setFocus(false);
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isFocused) {
            return;
        }
        this.selectionStart = -1;
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