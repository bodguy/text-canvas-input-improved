import { describe, expect, it } from 'vitest'
import { TextInput } from '@/TextInput'

describe('TextInput', () => {
    const canvas = document.createElement('canvas')
    const textInput = new TextInput({}, canvas)
    textInput.focus = true

    function keydownEvent(key: string, altKey: boolean = false, shiftKey: boolean = false, metaKey: boolean = false) {
        const keyEvent = new KeyboardEvent('keydown', { key, altKey, shiftKey, metaKey })
        document.dispatchEvent(keyEvent)
    }

    it('jsdom working test', () => {
        expect(typeof window).not.toBe('undefined')
    })

    it('set value and check test', () => {
        textInput.text = 'hello'
        expect(textInput.text).toBe('hello')
    })

    it('selection test: stop non-ascii, consecutive delimiters and ascii test', () => {
        textInput.text = 'hello한글@@!!!world'

        expect(textInput.isSelected()).toBeFalsy()
        keydownEvent('ArrowRight', true, true)
        expect(textInput.isSelected()).toBeTruthy()
        expect(textInput.getSelectionText()).toBe('hello')
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelectionText()).toBe('hello한글')
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelectionText()).toBe('hello한글@@')
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelectionText()).toBe('hello한글@@!!!')
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelectionText()).toBe('hello한글@@!!!world')
    })

    it('hangul assemble test', () => {
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        expect(textInput.text).toBe('한')
    })
})
