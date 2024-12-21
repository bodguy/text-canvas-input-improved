import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { TextInput } from '@/TextInput'
import { keydownEvent, doubleClickEvent } from './TestUtil'

describe('PasswordInput', () => {
    const canvas = document.createElement('canvas')
    const passwordInput = new TextInput({ type: 'password' }, canvas)

    beforeEach(() => {
        passwordInput.focus = true
    })

    afterEach(() => {
        passwordInput.text = ''
    })

    it('password input selection should not have boundary', () => {
        passwordInput.text = 'this is password'
        keydownEvent('ArrowLeft', true, true)
        expect(passwordInput.getSelection()).toStrictEqual([passwordInput.getLength(), 0])
    })

    it('password input should only accept ascii', () => {
        keydownEvent('ㄱ')
        keydownEvent('ㄴ')
        keydownEvent('q')
        keydownEvent('!')
        keydownEvent('1')
        expect(passwordInput.text).toBe('rsq!1')
    })

    it('password input selection with double click should select all text', () => {
        // passwordInput.text = 'this is password'
        // doubleClickEvent()
        // expect(passwordInput.getSelection()).toStrictEqual([0, passwordInput.getLength()])
    })

    it('should delete backward stop position when pressing Alt + Delete', () => {
        passwordInput.text = '한글 abcdㅁㄴㅁ!!!@@'
        keydownEvent('Home')
        keydownEvent('Delete', true)
        expect(passwordInput.text).toBe('')
    })

    it('should delete forward stop position when pressing Alt + Backspace', () => {
        passwordInput.text = '한글 abcdㅁㄴㅁ!!!@@'
        keydownEvent('End')
        keydownEvent('Backspace', true)
        expect(passwordInput.text).toBe('')
    })
})
