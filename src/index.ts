import * as Hangul from 'hangul-js';

type TextInputSettings = {
    font: string,
    fontColor: string,
    selectionFontColor: string,
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
    passwordChar: '\u25CF' | '*',
    disabled: boolean,
    disabledColor: string,
    disabledFontColor: string,
    disabledBorderColor: string,
    bounds: { x: number, y: number, w: number },
    padding: { top: number, left: number, right: number, bottom: number },
    border: { top: number, left: number, right: number, bottom: number },
    focusBorder: { top: number, left: number, right: number, bottom: number },
    enterCallback: (event: KeyboardEvent) => void,
    hoverCallback: (inOut: boolean) => void,
    focusCallback: (inOut: boolean) => void
};

function main() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    const showPasswordBtn = document.getElementById('show') as HTMLButtonElement;
    const enableBtn = document.getElementById('enable') as HTMLButtonElement;
    const inputs = [
        new TextInput({ bounds: { x: 10, y: 20, w: 300 }, maxLength: 8 }, canvas),
        new TextInput({ fontSize: 30, bounds: { x: 10, y: 50, w: 300 }, placeHolder: '한글을 입력해주세요' }, canvas),
        new TextInput({ bounds: { x: 10, y: 110, w: 300 }, type: 'number', placeHolder: '숫자', maxLength: 8 }, canvas),
        new TextInput({ bounds: { x: 10, y: 150, w: 300 }, type: 'password', placeHolder: '암호', maxLength: 15 }, canvas),
        new TextInput({ bounds: { x: 10, y: 180, w: 300 }, disabled: true }, canvas),
    ];
    showPasswordBtn.addEventListener('click', () => {
        const passwordInput = inputs[inputs.length - 2];
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPasswordBtn.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            showPasswordBtn.textContent = "Show";
        }
    });
    enableBtn.addEventListener('click', () => {
        const disabledInput = inputs[inputs.length - 1];
        if (disabledInput.disabled) {
            disabledInput.disabled = false;
            enableBtn.textContent = "Enable";
        } else {
            disabledInput.disabled = true;
            enableBtn.textContent = "Disable";
        }
    });
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // e.preventDefault();
        const keyCode = e.key;
        const shiftKey = e.shiftKey;

        if (keyCode === "Tab" && !shiftKey) {
            nextInputFocus();
            return;
        }

        if (keyCode === "Tab" && shiftKey) {
            previousInputFocus();
        }
    });
    const showPasswordBtn2 = document.getElementById('show2');
    const enableBtn2 = document.getElementById('enable2');

    showPasswordBtn2.addEventListener('click', () => {
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPasswordBtn2.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            showPasswordBtn2.textContent = "Show";
        }
    });
    enableBtn2.addEventListener('click', () => {
        const disabledInput = document.getElementById('disabled') as HTMLInputElement;
        if (disabledInput.disabled) {
            disabledInput.disabled = false;
            enableBtn2.textContent = "Enable";
        } else {
            disabledInput.disabled = true;
            enableBtn2.textContent = "Disable";
        }
    });

    function nextInputFocus() {
        const focusedIndex = inputs.findIndex(input => input.focus);
        const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;
        let nextIndex = (currentIndex + 1) % inputs.length;
    
        // Skip disabled inputs
        while(inputs[nextIndex].disabled) {
            nextIndex = (nextIndex + 1) % inputs.length;
            if (nextIndex === currentIndex) break; // Avoid infinite loop if all inputs are disabled
        }
    
        inputs[currentIndex].focus = false;
        inputs[nextIndex].focus = true;
        inputs[nextIndex].selectAllText();
    }

    function previousInputFocus() {
        const focusedIndex = inputs.findIndex(input => input.focus);
        const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;
        let nextIndex = (currentIndex - 1 + inputs.length) % inputs.length;
    
        // Skip disabled inputs
        while(inputs[nextIndex].disabled) {
            nextIndex = (nextIndex - 1 + inputs.length) % inputs.length;
            if (nextIndex === currentIndex) break; // Avoid infinite loop if all inputs are disabled
        }
    
        inputs[currentIndex].focus = false;
        inputs[nextIndex].focus = true;
        inputs[nextIndex].selectAllText();
    }

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
            context.fillText(text, x + w - textW - 8, y - 7);
        });

        lastTime = currentTime;
        window.requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

class TextInput {
    private static DELIMITERS = new Set([' ', ',', '.', ';', ':', '/', '[', ']', '-', '\\', '?']);
    private static KOREAN_TO_ENGLISH: Record<string, string> = {
        'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g', 'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
        'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't', 'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
        'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm', 
        'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T', 'o': 'ㅒ', 'p': 'ㅖ',
      };
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
    };
    
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private value: string; // 입력된 텍스트
    private selection: [number, number]; // 선택 [시작, 끝] 위치
    private isFocused: boolean; // 포커스 여부
    private selectionPos: number; // 선택 시작 위치 (마우스 클릭할때만 사용)
    private blinkTimer: number; // 커서 깜빡임 타이머
    private maxLength: number; // 최대 글자 (-1인 경우 무한)
    private assemblePos: number;
    private startPos: number; // TODO: 텍스트내 보여줄 시작 위치
    private wasOver: boolean;
    private settings: typeof TextInput.defaultSettings;

    constructor(settings: Partial<TextInputSettings>, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.settings = Object.assign({}, TextInput.defaultSettings, settings);
        this.value = this.settings.defaultValue;
        this.selection = [0, 0];
        this.isFocused = false;
        this.blinkTimer = 0;
        this.maxLength = this.settings.maxLength;
        this.resetSelectionPos();
        this.resetAssembleMode();
        this.startPos = 0;
        this.wasOver = false;

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

        if (this.disabled) {
            this.context.fillStyle = this.settings.disabledColor;
            this.context.fillRect(this.settings.bounds.x - this.settings.padding.left, this.settings.bounds.y - this.settings.padding.top, area.w, area.h);
        }
        
        if (this.isFocused) {
            if (this.isSelected()) {
                const selectOffset = this.measureText(this.getSubText(0, Math.min(this.selection[0], this.selection[1])));
                const selectWidth = this.measureText(this.getSelectionText());
                this.context.fillStyle = this.settings.selectionColor;
                this.context.fillRect(selectOffset + x, y - 1, selectWidth, this.settings.fontSize + 3);
            } else {
                if (this.cursorBlink()) {
                    const cursorOffset = this.measureText(this.getSubText(0, this.selection[0]));
                    this.context.fillStyle = this.settings.fontColor;
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
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.fontColor;
        this.context.fillText(beforeValue, x, textY);
        // selection
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.selectionFontColor;
        this.context.fillText(selectionValue, x + this.measureText(before), textY);
        // after
        this.context.fillStyle = this.disabled ? this.settings.disabledFontColor : this.settings.fontColor;
        this.context.fillText(afterValue, x + this.measureText(before + selectionText), textY);

        // draw placeholder
        if (this.isEmpty()) {
            this.context.fillStyle = this.settings.placeHolderColor;
            this.context.fillText(this.settings.placeHolder, x, textY);
        }

        // draw underline to handle hangul assemble mode
        if (this.isFocused && this.isAssembleMode()) {
            this.drawUnderline();
        }
        
        this.drawRect(area.x, area.y, area.w, area.h);

        this.context.restore();
    }

    update(deltaTime: number) {
        this.blinkTimer += deltaTime;
    }

    private moveSelection(position: number) {
        this.setSelection(position, position);
    }

    private setSelection(start: number, end: number) {
        start = this.clamp(start, 0, this.value.length);
        end = this.clamp(end, 0, this.value.length);

        this.selection[0] = start;
        this.selection[1] = end;
        this.blinkTimer = this.settings.caretBlinkRate;
    }

    isSelected(): boolean {
        return this.selection[0] !== this.selection[1];
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

    set text(value: string) {
        this.value = value;
    }

    get text(): string {
        return this.value;
    }

    get focus(): boolean {
        return this.isFocused;
    }

    set focus(value: boolean) {
        if (value && !this.disabled) {
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

    get disabled(): boolean {
        return this.settings.disabled;
    }

    set disabled(value: boolean) {
        this.settings.disabled = value;
        this.focus = false;
    }

    get type(): 'text' | 'number' | 'password' {
        return this.settings.type;
    }
    
    set type(value: 'text' | 'number' | 'password') {
        this.settings.type = value;
        this.resetAssembleMode();
        this.onCancelOfSelectionEnd();
    }

    private getDrawText(str: string): string {
        return this.type === 'password' ? this.settings.passwordChar.repeat(str.length) : str
    }

    private drawUnderline() {
        const x = this.getStartX();
        const y = this.getStartY() + this.settings.fontSize - 2;
        this.context.fillStyle = this.settings.underlineColor;
        const cursorOffset = this.measureText(this.getAssemblePosBefore());
        const singleCharWidth = this.measureText(this.getAssemblePosChar());
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

    private extendSelection(start: number, end: number) {
        this.setSelection(start, end);
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
                    this.extendSelection(this.selection[0], this.value.length);
                } else {
                     // Move selection to the right by one character
                    this.extendSelection(this.selection[0], this.selection[1] + 1);
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the end of text
                    this.onEndOfSelection();
                } else {
                    // Clear the selection and move cursor to the right boundary of the selection
                    const rightBoundary = Math.max(this.selection[0], this.selection[1]);
                    this.moveSelection(rightBoundary);
                }
            }
            return;
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getNearestWordIndex(this.selection[1] + 1)[1];

            if (shiftKey) {
                // If shift is pressed, extend the selection to the next word boundary
                this.extendSelection(this.selection[0], nextCurPos);
            } else {
                // Without shift, simply move the cursor
                this.moveSelection(nextCurPos);
            }
            return;
        }

        // Move cursor to the end of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            if (shiftKey) {
                this.extendSelection(this.selection[0], this.value.length);    
            } else {
                this.onEndOfSelection();
            }
            return;
        }
        
        // Move cursor to the right by one character
        if (shiftKey) {
            // Extend selection while holding the shift key
            this.extendSelection(this.selection[0], this.selection[1] + 1);
        } else {
            // Move cursor without extending selection
            this.moveSelection(this.selection[1] + 1);
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
                    this.extendSelection(0, this.selection[1]);
                } else {
                    // Move selection to the left by one character
                    this.extendSelection(this.selection[0], this.selection[1] - 1);
                }
            } else {
                if (metaKey || controlKey) {
                    // Clear the selection and Move cursor to the beginning of text
                    this.onStartOfSelection();
                } else {
                    // Clear the selection and move cursor to the left boundary of the selection
                    const leftBoundary = Math.min(this.selection[0], this.selection[1]);
                    this.moveSelection(leftBoundary);
                }
            }
            return;
        }

        if (altKey) {
            // Handle shift key with alt key for word movement
            const nextCurPos = this.getNearestWordIndex(this.selection[0] - 1)[0];
                
            if (shiftKey) {
                this.extendSelection(this.selection[1], nextCurPos);
            } else {
                // Without shift, simply move the cursor
                this.moveSelection(nextCurPos);
            }
            return;
        }

        // Move cursor to the start of the text if meta/control key is pressed
        if (metaKey || controlKey) {
            if (shiftKey) {
                this.extendSelection(this.selection[1], 0);
            } else {
                this.onStartOfSelection();
            }
            return;
        }

        // Move cursor to the left by one character
        if (shiftKey) {
            // Extend selection while holding the shift key
            this.extendSelection(this.selection[0], this.selection[1] - 1);
        } else {
            // Move cursor without extending selection
            this.moveSelection(this.selection[1] - 1);
        }
    }

    private onStartOfSelection() {
        this.moveSelection(0);
    }

    private onEndOfSelection() {
        this.moveSelection(this.value.length);
    }

    private onCancelOfSelectionStart() {
        this.moveSelection(this.selection[0]);
    }

    private onCancelOfSelectionEnd() {
        this.moveSelection(this.selection[1]);
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

    private isNumeric(value: string): boolean {
        return /^-?\d+$/.test(value)
    }

    private appendValue(value: string, resetAssemble: boolean = false) {
        if (this.type === 'number' && !this.isNumeric(value)) {
            return;
        }

        const [before, after] = this.getSelectionOutside();

        if (this.isMaxLengthOverflow(value)) {
            // Calculate the remaining allowed length
            const remainingLength = this.settings.maxLength - (before.length + after.length);

            // Trim the value to fit within the remaining allowed length
            const newValue = value.substring(0, remainingLength);

            // Handle input as the non-Hangul only if there's still space
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

        // const totalWidth = this.measureText(this.value);
        // if (totalWidth > this.settings.bounds.x) {
        //     console.log('overflow!');
        // }
    }

    private handleHangul(beforeValue: string, newValue: string, afterValue: string) {
        if (this.type === 'password') {
            this.assembleHangul(beforeValue, this.convertKoreanToEnglish(newValue), afterValue);
            return;
        }

        // assemble hangul according to current assemble mode
        if (this.isAssembleMode()) {
            this.assembleHangul(this.getAssemblePosBefore(), Hangul.a(Hangul.d(this.getAssemblePosChar() + newValue)), afterValue);
        } else {
            this.assembleHangul(beforeValue, Hangul.a(Hangul.d(newValue)), afterValue);
        }
    }

    private assembleHangul(beforeValue: string, newValue: string, afterValue: string) {
        this.text = beforeValue + newValue + afterValue;
        const selectionPos = beforeValue.length + newValue.length;
        this.moveSelection(selectionPos);
        this.setAssemblePos(selectionPos - 1);
    }

    private handleNonHangul(before: string, value: string, after: string) {
        const lastCurPos = before.length + value.length;
        this.text = before + value + after;
        this.moveSelection(lastCurPos);
        this.resetAssembleMode();
    }

    private onRemove(keyEvent: KeyboardEvent) {
        keyEvent.preventDefault();

        const metaKey = keyEvent.metaKey;

        if (this.isSelected()) {
            // If text is selected, remove the selected text
            const [before, after] = this.getSelectionOutside();
            this.text = before + after;
            this.moveSelection(before.length);
            return;
        }

        if (this.isAssembleMode() && !metaKey) {
            const before = this.getAssemblePosBefore();
            const disassembled = Hangul.d(this.getAssemblePosChar());
            const after = this.getAssemblePosAfter();
            const assembled = Hangul.a(disassembled.slice(0, -1));

            if (assembled === '') {
                this.resetAssembleMode();
            }

            const prefix = before + assembled;
            this.text = prefix + after;
            this.moveSelection(prefix.length);
            return;
        }

        // If no text is selected, remove the character before the cursor
        const [before, after] = this.getSelectionOutside();
        const newBefore = before.slice(0, metaKey ? before.length * -1 : -1);
        this.text = newBefore + after;
        this.moveSelection(newBefore.length);
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
        if (this.contains(mousePos.x, mousePos.y) && !this.disabled) {
            this.settings.hoverCallback(true);
            this.canvas.style.cursor = 'text';
            this.wasOver = true;
        } else {
            this.settings.hoverCallback(false);
            if (this.wasOver) {
                this.canvas.style.cursor = 'default';
                this.wasOver = false;
            }
        }
            
        if (!this.isFocused || !this.isSelectionStart()) {
            return
        }

        const curPos = this.textPos(mousePos.x, mousePos.y);
        const start = Math.min(this.selectionPos, curPos);
        const end = Math.max(this.selectionPos, curPos);

        this.extendSelection(start, end);
    }

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
        const leftButton = event.button === 0;
        const mousePos = this.getMousePos(event);
        this.resetAssembleMode();

        if (leftButton && this.contains(mousePos.x, mousePos.y) && !this.disabled) {
            this.focus = true;

            const curPos = this.textPos(mousePos.x, mousePos.y);

            if (event.detail === 3 && curPos >= this.selection[0] && curPos <= this.selection[1]) {
                this.selectAllText();
                return;
            }

            this.moveSelection(curPos);
            this.selectionPos = curPos;

            return;
        }

        this.focus = false;
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
            this.extendSelection(start, end);
        }
    }

    private async onCopy(event: ClipboardEvent) {
        if (!this.isFocused || this.type === 'password' || this.isEmpty()) return;
        await navigator.clipboard.writeText(this.getSelectionText());
    }

    private async onPaste(event: ClipboardEvent) {
        if (!this.isFocused) return;
        const text = await navigator.clipboard.readText()
        this.appendValue(text, true);
    }

    private async onCut(event: ClipboardEvent) {
        if (!this.isFocused || this.type === 'password' || this.isEmpty()) return;
        await navigator.clipboard.writeText(this.getSelectionText());
        const [before, after] = this.getSelectionOutside();
        this.text = before + after;
        this.moveSelection(before.length);
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

    selectAllText() {
        this.extendSelection(0, this.value.length);
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
        this.context.strokeStyle = this.isFocused ? this.settings.focusBoxColor : 
            (this.disabled ? this.settings.disabledBorderColor : this.settings.boxColor);

        // left vertical line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.left : this.settings.border.left;
        this.context.moveTo(x + 0.5, y + edge);
        this.context.lineTo(x + 0.5, y + h);
    
        // right vertical line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.right : this.settings.border.right;
        this.context.moveTo(x + w + 0.5, y + edge);
        this.context.lineTo(x + w + 0.5, y + h);
    
        // top horizontal line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.top : this.settings.border.top;
        this.context.moveTo(x + edge, y + 0.5);
        this.context.lineTo(x + w, y + 0.5);
    
        // bottom horizontal line
        this.context.lineWidth = this.isFocused ? this.settings.focusBorder.bottom : this.settings.border.bottom;
        this.context.moveTo(x + edge, y + h + 0.5);
        this.context.lineTo(x + w, y + h + 0.5);
    
        this.context.stroke();
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    private convertKoreanToEnglish(value: string): string {
        return TextInput.KOREAN_TO_ENGLISH[value] ?? value;
    } 
}

document.addEventListener("DOMContentLoaded", main);