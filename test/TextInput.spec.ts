import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { TextInput } from '@/TextInput'
import { keydownEvent } from './TestUtil'

describe('TextInput', () => {
    const canvas = document.createElement('canvas')
    const textInput = new TextInput({}, canvas)

    beforeEach(() => {
        textInput.focus = true
    })

    afterEach(() => {
        textInput.text = ''
    })

    it('should set and retrieve the value of text input', () => {
        textInput.text = 'hello'
        expect(textInput.text).toBe('hello')
    })

    it('should handle selection with non-ASCII characters, consecutive delimiters, and ASCII text', () => {
        textInput.text = 'hello한글@@!!!world'
        keydownEvent('Home')

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

    it('should assemble Hangul characters correctly', () => {
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        expect(textInput.text).toBe('한')
    })

    it('should handle Hangul assembly edge case where new characters are appended', () => {
        textInput.text = 'ㅎㅏㄴ'
        keydownEvent('End')
        keydownEvent('ㄱ')
        keydownEvent('ㅡ')
        expect(textInput.text).toBe('ㅎㅏㄴ그')
    })

    it('should handle Hangul assembly edge case where characters are inserted in the middle', () => {
        textInput.text = 'ㅎㅏ'
        keydownEvent('ArrowLeft')
        keydownEvent('ㄱ')
        keydownEvent('ㅡ')
        keydownEvent('ㄹ')
        expect(textInput.text).toBe('ㅎ글ㅏ')
    })

    it('should move the caret to the correct position using the right arrow key', () => {
        textInput.text = 'hello world'
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowLeft')
        }
        expect(textInput.getSelection()).toStrictEqual([7, 7])
    })

    it('should move the caret to the end of text after selecting all and pressing right arrow key', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowRight')
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])
    })

    it('should move the caret to the start of text after selecting all and pressing left arrow key', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowLeft')
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })

    it('should delete text correctly after entering and backspacing', () => {
        keydownEvent('a')
        keydownEvent('b')
        keydownEvent('c')
        keydownEvent('Backspace')
        keydownEvent('Backspace')
        keydownEvent('Backspace')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('should not move caret left when already at the start of text', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        expect(textInput.getSelection()).toStrictEqual([0, 0])

        keydownEvent('ArrowLeft')
        keydownEvent('ArrowLeft')
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })

    it('should not move caret right when already at the end of text', () => {
        textInput.text = 'hello world'
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])

        keydownEvent('ArrowRight')
        keydownEvent('ArrowRight')
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])
    })

    it('should select text from caret position to the start when pressing Shift + Home', () => {
        textInput.text = 'hello world'
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowLeft')
        }
        keydownEvent('Home', false, true)
        expect(textInput.getSelection()).toStrictEqual([7, 0])
    })

    it('should select text from caret position to the end when pressing Shift + End', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('End', false, true)
        expect(textInput.getSelection()).toStrictEqual([4, textInput.getLength()])
    })

    it('delete when no text is present should not throw errors', () => {
        textInput.text = ''
        keydownEvent('Backspace')
        keydownEvent('Delete')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('insert text in the middle of existing text', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 5; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('X')
        expect(textInput.text).toBe('helloX world')
    })

    it('delete selected text', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('Backspace')
        expect(textInput.text).toBe('')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('handle selection wraparound', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        keydownEvent('ArrowRight', true, true)
        keydownEvent('ArrowLeft', true, true)
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })

    it('handle consecutive Backspace actions', () => {
        textInput.text = 'abcde'
        for (let i = 0; i < 5; i++) {
            keydownEvent('Backspace')
        }
        expect(textInput.text).toBe('')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('handle consecutive Delete actions', () => {
        textInput.text = 'abcde'
        keydownEvent('Home')
        for (let i = 0; i < 5; i++) {
            keydownEvent('Delete')
        }
        expect(textInput.text).toBe('')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('cursor at the start of text with Delete', () => {
        textInput.text = 'hello'
        keydownEvent('Home')
        keydownEvent('Delete')
        expect(textInput.text).toBe('ello')
    })

    it('cursor at the end of text with Backspace', () => {
        textInput.text = 'hello'
        keydownEvent('End')
        keydownEvent('Backspace')
        expect(textInput.text).toBe('hell')
    })

    it('Shift + ArrowLeft at start should do nothing', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        keydownEvent('ArrowLeft', false, true)
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })

    it('Shift + ArrowRight at end should do nothing', () => {
        textInput.text = 'hello world'
        keydownEvent('End')
        keydownEvent('ArrowRight', false, true)
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])
    })

    it('insert Hangul characters in between existing text', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 5; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        expect(textInput.text).toBe('hello한 world')
    })

    it('delete Hangul character parts', () => {
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        keydownEvent('Backspace')
        expect(textInput.text).toBe('하')
        keydownEvent('Backspace')
        expect(textInput.text).toBe('ㅎ')
        keydownEvent('Backspace')
        expect(textInput.text).toBe('')
    })

    it('delete Hangul character from the middle of text', () => {
        textInput.text = 'hello한world'
        keydownEvent('Home')
        for (let i = 0; i < 5; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('Delete')
        expect(textInput.text).toBe('helloworld')
    })

    it('backspace at start of text should do nothing', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        keydownEvent('Backspace')
        expect(textInput.text).toBe('hello world')
    })

    it('delete at end of text should do nothing', () => {
        textInput.text = 'hello world'
        keydownEvent('End')
        keydownEvent('Delete')
        expect(textInput.text).toBe('hello world')
    })

    it('select text and overwrite with new input', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('X')
        expect(textInput.text).toBe('X')
    })

    it('delete part of selection', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowLeft', true, true)
        keydownEvent('Backspace')
        expect(textInput.text).toBe('world')
    })

    it('replace a part of selection with Hangul', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowLeft', true, true)
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        expect(textInput.text).toBe('한world')
    })

    it('should stop start caret position when Alt + Right key down', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('ArrowLeft', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 0])
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 4])
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 5])
    })

    it('should stop start caret position when Alt + Left key down', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('ArrowRight', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 5])
        keydownEvent('ArrowLeft', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 4])
        keydownEvent('ArrowLeft', true, true)
        expect(textInput.getSelection()).toStrictEqual([4, 0])
    })
})
