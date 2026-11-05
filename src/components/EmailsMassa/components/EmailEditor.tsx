"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TextStyle } from "@tiptap/extension-text-style"
import { Extension } from "@tiptap/core"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { ListOrdered, Eraser, Minus } from "lucide-react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { forwardRef, useImperativeHandle } from "react"

type Props = {
  content: string
  onChange: (html: string) => void
}

export type EmailEditorRef = {
  insertPlaceholder: (value: string) => void
}

export const EmailEditor = forwardRef<EmailEditorRef, Props>(
  ({ content, onChange }, ref) => {

    const FontSize = Extension.create({
      name: "fontSize",

      addGlobalAttributes() {
        return [
          {
            types: ["textStyle"],
            attributes: {
              fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize,
                renderHTML: attributes => {
                  if (!attributes.fontSize) return {}
                  return { style: `font-size: ${attributes.fontSize}` }
                },
              },
            },
          },
        ]
      },
    })

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
        }),
        TextStyle,
        FontSize,
        Color,
        Underline,
        Highlight,
        HorizontalRule,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["paragraph"] }),
      ],
      content,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    })

    useImperativeHandle(ref, () => ({
      insertPlaceholder(value: string) {
        editor?.chain().focus().insertContent(`{{${value}}}`).run()
      }
    }))

    if (!editor) return null

    return (
      <div className="rounded-xl border bg-background p-4 space-y-4">

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant={editor.isActive("bold") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant={editor.isActive("italic") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant={editor.isActive("underline") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <select
            className="border rounded px-2 py-1 text-sm cursor-pointer"
            onChange={(e) =>
              editor.chain().focus().setMark("textStyle", {
                fontSize: e.target.value,
              }).run()
            }
            defaultValue=""
          >
            <option value="" disabled>Tamanho</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
          </select>

          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant="outline"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant="outline"
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          >
            <Eraser className="w-4 h-4" />
          </Button>

          {/* <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant="outline"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"

            type="button"
            size="icon"
            variant="outline"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" />
          </Button> */}

          <Separator orientation="vertical" className="h-6" />

          <Button
            className="cursor-pointer"
            size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"
            size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer"
            size="icon" variant="outline" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="w-4 h-4" />
          </Button>

          <input
            type="color"
            className="w-8 h-8 border rounded cursor-pointer bg-transparent"
            onInput={(e: any) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />

          <Button
            className="cursor-pointer"
            type="button"
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Limpar cor
          </Button>
        </div>

        {/* EDITOR */}
        <div
          className="min-h-[300px] rounded-md border bg-white text-black cursor-text"
          onClick={() => editor.chain().focus().run()}
        >
          <EditorContent
            editor={editor}
            className="w-full h-full min-h-[300px] p-4 outline-none
                      [&_ul]:list-disc
                      [&_ul]:pl-6
                      [&_ol]:list-decimal
                      [&_ol]:pl-6"
          />
        </div>
      </div>
    )
  }
)