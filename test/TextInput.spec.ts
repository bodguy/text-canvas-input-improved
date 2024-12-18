import { describe, expect, it, beforeEach, afterEach  } from 'vitest'
import { TextInput } from '@/TextInput'
import { keydownEvent } from './TestUtil'
import {  } from 'node:test'

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
