import { describe, expect, it, beforeEach, afterEach  } from 'vitest'
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

    it('set value and check test', () => {
        textInput.text = 'hello'
        expect(textInput.text).toBe('hello')
    })

    it('selection stop non-ascii, consecutive delimiters and ascii test', () => {
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

    it('hangul assemble test', () => {
        keydownEvent('ㅎ')
        keydownEvent('ㅏ')
        keydownEvent('ㄴ')
        expect(textInput.text).toBe('한')
    })

    it('hangul assemble edge case', () => {
        textInput.text = 'ㅎㅏㄴ'
        keydownEvent('End')
        keydownEvent('ㄱ')
        keydownEvent('ㅡ')
        expect(textInput.text).toBe('ㅎㅏㄴ그')
    })

    it('hangul assemble edge case2', () => {
        textInput.text = 'ㅎㅏ'
        keydownEvent('ArrowLeft')
        keydownEvent('ㄱ')
        keydownEvent('ㅡ')
        keydownEvent('ㄹ')
        expect(textInput.text).toBe('ㅎ글ㅏ')
    })

    it('basic right cursor move', () => {
        textInput.text = 'hello world'
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowLeft')
        }
        expect(textInput.getSelection()).toStrictEqual([7, 7])
    })

    it('selectAllText and right keydown then cursor should be to the end of text', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowRight')
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])
    })

    it('selectAllText and left keydown then cursor should be to the start of text', () => {
        textInput.text = 'hello world'
        textInput.selectAllText()
        keydownEvent('ArrowLeft')
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })
    
    it('enter several text and delete them should work', () => {
        keydownEvent('a')
        keydownEvent('b')
        keydownEvent('c')
        keydownEvent('Backspace')
        keydownEvent('Backspace')
        keydownEvent('Backspace')
        expect(textInput.isEmpty()).toBeTruthy()
    })

    it('ArrowLeft does not make any difference', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        expect(textInput.getSelection()).toStrictEqual([0, 0])
        
        keydownEvent('ArrowLeft')
        keydownEvent('ArrowLeft')
        expect(textInput.getSelection()).toStrictEqual([0, 0])
    })

    it('ArrowRight does not make any difference', () => {
        textInput.text = 'hello world'
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])

        keydownEvent('ArrowRight')
        keydownEvent('ArrowRight')
        expect(textInput.getSelection()).toStrictEqual([textInput.getLength(), textInput.getLength()])
    })

    it('Shift + Home should select from current caret to 0', () => {
        textInput.text = 'hello world'
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowLeft')
        }
        keydownEvent('Home', false, true)
        expect(textInput.getSelection()).toStrictEqual([7, 0])
    })

    it('Shift + End should select from current caret to end', () => {
        textInput.text = 'hello world'
        keydownEvent('Home')
        for (let i = 0; i < 4; i++) {
            keydownEvent('ArrowRight')
        }
        keydownEvent('End', false, true)
        expect(textInput.getSelection()).toStrictEqual([4, textInput.getLength()])
    })
})
