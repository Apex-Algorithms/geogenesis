import UniqueID from '@tiptap-pro/extension-unique-id';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SquareButton } from '~/modules/design-system/button';
import { ConfiguredCommandExtension } from './command-extension';
import { TableNode } from './table-node';

interface Props {
  spaceId: string;
  editable?: boolean;
}

export const Editor = ({ editable = true, spaceId }: Props) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        ConfiguredCommandExtension(spaceId),
        TableNode,
        Image,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
              return 'Heading...';
            }

            return '/ to select content block or write some content...';
          },
        }),
        // TextBlock,
        // HeadingBlock,
        UniqueID.configure({
          types: ['tableNode', 'p', 'heading'],
        }),
      ],
      editable,
      onUpdate: ({ editor }) => {
        // console.log(editor.getJSON());
      },
      onBlur({ editor, event }) {
        // The editor isn’t focused anymore.
      },
    },
    [editable]
  );

  return editor ? (
    <>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>
        <div className="absolute -left-12 -top-3">
          <SquareButton onClick={() => editor.chain().focus().insertContent('/').run()} icon="plus" />
        </div>
      </FloatingMenu>
    </>
  ) : null;
};
