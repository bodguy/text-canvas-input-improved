import { TextInput } from '@/TextInput'

function main() {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
    const context = canvas.getContext('2d')!
    const showPasswordBtn = document.getElementById('show') as HTMLButtonElement
    const enableBtn = document.getElementById('enable') as HTMLButtonElement
    const inputs = [
        new TextInput({ bounds: { x: 10, y: 20, w: 300 }, maxLength: 8 }, canvas),
        new TextInput({ fontSize: 30, bounds: { x: 10, y: 50, w: 300 }, placeHolder: '한글을 입력해주세요' }, canvas),
        new TextInput({ bounds: { x: 10, y: 110, w: 300 }, type: 'number', placeHolder: '숫자', maxLength: 8 }, canvas),
        new TextInput(
            { bounds: { x: 10, y: 150, w: 300 }, type: 'password', placeHolder: '암호', maxLength: 15 },
            canvas
        ),
        new TextInput({ bounds: { x: 10, y: 180, w: 300 }, disabled: true }, canvas)
    ]
    showPasswordBtn.addEventListener('click', () => {
        const passwordInput = inputs[inputs.length - 2]
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'
            showPasswordBtn.textContent = 'Hide'
        } else {
            passwordInput.type = 'password'
            showPasswordBtn.textContent = 'Show'
        }
    })
    enableBtn.addEventListener('click', () => {
        const disabledInput = inputs[inputs.length - 1]
        if (disabledInput.disabled) {
            disabledInput.disabled = false
            enableBtn.textContent = 'Enable'
        } else {
            disabledInput.disabled = true
            enableBtn.textContent = 'Disable'
        }
    })
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // e.preventDefault();
        const keyCode = e.key
        const shiftKey = e.shiftKey

        if (keyCode === 'Tab' && !shiftKey) {
            nextInputFocus()
            return
        }

        if (keyCode === 'Tab' && shiftKey) {
            previousInputFocus()
        }
    })
    const showPasswordBtn2 = document.getElementById('show2')
    const enableBtn2 = document.getElementById('enable2')

    showPasswordBtn2.addEventListener('click', () => {
        const passwordInput = document.getElementById('password') as HTMLInputElement
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'
            showPasswordBtn2.textContent = 'Hide'
        } else {
            passwordInput.type = 'password'
            showPasswordBtn2.textContent = 'Show'
        }
    })
    enableBtn2.addEventListener('click', () => {
        const disabledInput = document.getElementById('disabled') as HTMLInputElement
        if (disabledInput.disabled) {
            disabledInput.disabled = false
            enableBtn2.textContent = 'Enable'
        } else {
            disabledInput.disabled = true
            enableBtn2.textContent = 'Disable'
        }
    })

    function nextInputFocus() {
        const focusedIndex = inputs.findIndex((input) => input.focus)
        const currentIndex = focusedIndex === -1 ? 0 : focusedIndex
        let nextIndex = (currentIndex + 1) % inputs.length

        // Skip disabled inputs
        while (inputs[nextIndex].disabled) {
            nextIndex = (nextIndex + 1) % inputs.length
            if (nextIndex === currentIndex) break // Avoid infinite loop if all inputs are disabled
        }

        inputs[currentIndex].focus = false
        inputs[nextIndex].focus = true
        inputs[nextIndex].selectAllText()
    }

    function previousInputFocus() {
        const focusedIndex = inputs.findIndex((input) => input.focus)
        const currentIndex = focusedIndex === -1 ? 0 : focusedIndex
        let nextIndex = (currentIndex - 1 + inputs.length) % inputs.length

        // Skip disabled inputs
        while (inputs[nextIndex].disabled) {
            nextIndex = (nextIndex - 1 + inputs.length) % inputs.length
            if (nextIndex === currentIndex) break // Avoid infinite loop if all inputs are disabled
        }

        inputs[currentIndex].focus = false
        inputs[nextIndex].focus = true
        inputs[nextIndex].selectAllText()
    }

    let lastTime = 0
    function step(currentTime: DOMHighResTimeStamp) {
        const deltaTime = (currentTime - lastTime) / 1000
        context.clearRect(0, 0, canvas.width, canvas.height)

        inputs.forEach((it) => it.update(deltaTime))
        inputs.forEach((it) => it.draw())
        inputs.forEach((it) => {
            const { x, y, w } = it.area()
            const maxLength = it.getMaxLength()

            if (maxLength === -1) return

            context.font = `12px Monospaced`
            context.textAlign = 'left'
            context.textBaseline = 'middle'
            context.fillStyle = 'gray'
            const text = `${maxLength - it.getLength()} remain`
            const textW = context.measureText(text).width
            context.fillText(text, x + w - textW - 8, y - 7)
        })

        lastTime = currentTime
        window.requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
}

document.addEventListener('DOMContentLoaded', main)
