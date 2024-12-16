import { describe, expect, it } from "vitest";
import { TextInput } from "@/TextInput";

describe("TextInput", () => {
    const canvas = new HTMLCanvasElement();
    const textInput = new TextInput({}, canvas);

    it("show value", () => {
        textInput.text = "hello"
        expect(textInput.text).toEqual("hello");
    });
})