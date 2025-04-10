import { getChecksumAddress } from '@graphprotocol/grc-20';
import { Effect } from 'effect';
import type * as S from 'zapatos/schema';

import type { EditorAdded } from './parser';
import { Spaces } from '~/sink/db';
import { InvalidPluginAddressForDaoError } from '~/sink/errors';
import type { BlockEvent } from '~/sink/types';

export function mapEditors(editorAdded: EditorAdded[], block: BlockEvent) {
  return Effect.gen(function* (_) {
    const editors: S.space_editors.Insertable[] = [];

    yield* _(Effect.logDebug('[MAP EDITORS] Started'));

    for (const editor of editorAdded) {
      const maybeSpaceIdForVotingPluginEffect = Effect.tryPromise({
        try: () => Spaces.findForVotingPlugin(editor.mainVotingPluginAddress),
        catch: () =>
          new InvalidPluginAddressForDaoError(
            `[MAP EDITORS] Could not find space for main voting plugin address ${editor.mainVotingPluginAddress}`
          ),
      });

      const maybeSpaceIdForPersonalPluginEffect = Effect.tryPromise({
        try: () => Spaces.findForPersonalPlugin(editor.mainVotingPluginAddress),
        catch: () =>
          new InvalidPluginAddressForDaoError(
            `[MAP EDITORS] Could not find space for main voting plugin address ${editor.mainVotingPluginAddress}`
          ),
      });

      const [maybeSpaceIdForVotingPlugin, maybeSpaceIdForPersonalPlugin] = yield* _(
        Effect.all([maybeSpaceIdForVotingPluginEffect, maybeSpaceIdForPersonalPluginEffect], { concurrency: 2 })
      );

      if (!maybeSpaceIdForVotingPlugin && !maybeSpaceIdForPersonalPlugin) {
        yield* _(
          Effect.logError(
            `[MAP EDITORS] Matching space for approved editor not found for plugin address ${editor.mainVotingPluginAddress}`
          )
        );

        continue;
      }

      if (maybeSpaceIdForVotingPlugin) {
        const newMember: S.space_editors.Insertable = {
          account_id: getChecksumAddress(editor.editorAddress),
          space_id: maybeSpaceIdForVotingPlugin,
          created_at: block.timestamp,
          created_at_block: block.blockNumber,
        };

        editors.push(newMember);
      }

      if (maybeSpaceIdForPersonalPlugin) {
        const newMember: S.space_editors.Insertable = {
          account_id: getChecksumAddress(editor.editorAddress),
          space_id: maybeSpaceIdForPersonalPlugin.id,
          created_at: block.timestamp,
          created_at_block: block.blockNumber,
        };

        editors.push(newMember);
      }
    }

    return editors;
  });
}
