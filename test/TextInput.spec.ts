import { describe, expect, it } from 'vitest'
import { TextInput } from '@/TextInput'

describe('TextInput', () => {
    it('jsdom working', () => {
        expect(typeof window).not.toBe('undefined')
    })

    const canvas = document.createElement('canvas')
    const textInput = new TextInput({}, canvas)

    it('set value and check', () => {
        textInput.text = 'hello'
        expect(textInput.text).toBe('hello')
    })

    it('stop non-ascii, consecutive delimiters, ascii', () => {
        const sampleText = 'hello한글@@!!!world'
        textInput.text = sampleText
        // expect(textInput.)
    })
})
