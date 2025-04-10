import { cache } from 'react';

import { cachedFetchSpace } from '~/app/space/[id]/cached-fetch-space';

export const getIsEditorForSpace = cache(async (spaceId: string, connectedAddress?: string): Promise<boolean> => {
  const space = await cachedFetchSpace(spaceId);

  if (!space) {
    throw new Error("Space doesn't exist");
  }

  // @HACK to get around incorrect checksum addresses in substream
  return connectedAddress ? space.editors.map(e => e.toLowerCase()).includes(connectedAddress?.toLowerCase()) : false;
});
