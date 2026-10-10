import React from 'react';
import BeatManagementView from './BeatManagementView';

export default function BeatsView({
  onFilterBeat,
}: {
  onFilterBeat?: (beatNo: string) => void;
}) {
  return <BeatManagementView onFilterBeat={onFilterBeat} />;
}
