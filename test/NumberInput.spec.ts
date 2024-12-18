import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { TextInput } from '@/TextInput'

describe('NumberInput', () => {
    const canvas = document.createElement('canvas')
    const numberInput = new TextInput({ type: 'number' }, canvas)

    beforeEach(() => {
        numberInput.focus = true
    })

    afterEach(() => {
        numberInput.text = ''
    })

    it('number input should only accept decimal number', () => {
        numberInput.text = 'hello world'
        expect(numberInput.text).toBe('')
    })
})