import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

// ---------------------------------------------------------------------------
// IMAGE SOURCES — the actual files in assets/behaviour. Filenames kept
// exactly as they exist on disk, including the typos in "eatig good 2.png",
// "grabing toys.png" and "tooys packed.png" (rename the files on disk, then
// update the require() calls below, if you want to fix the typos).
// ---------------------------------------------------------------------------
const eatingGood = require('../../assets/behaviour/eating good.png');
const eatingBad = require('../../assets/behaviour/eating bad.png');
const eatingGood2 = require('../../assets/behaviour/eatig good 2.png');
const eatingBad2 = require('../../assets/behaviour/eating bad 2.png');
const handsWashing = require('../../assets/behaviour/washing hands.png');
const handsNotWashing = require('../../assets/behaviour/not washing hands.png');
const teethBrushing = require('../../assets/behaviour/brushing teeth.png');
const teethNotBrushing = require('../../assets/behaviour/not brushing teeth.png');
const toySharing = require('../../assets/behaviour/sharing toys.png');
const toyNotSharing = require('../../assets/behaviour/not sharing toys.png');
const toyGiving = require('../../assets/behaviour/giving toys.png');
const toyGrabbing = require('../../assets/behaviour/grabing toys.png');
const foodSharing = require('../../assets/behaviour/sharing food.png');
const foodNotSharing = require('../../assets/behaviour/not sharing foods.png');
const roadCrossingGood = require('../../assets/behaviour/cross road good.png');
const roadCrossingBad = require('../../assets/behaviour/cross road bad.png');
const foodChoiceGood = require('../../assets/behaviour/good foods.png');
const foodChoiceBad = require('../../assets/behaviour/bad foods.png');
const toysPacked = require('../../assets/behaviour/tooys packed.png');
const toysUnpacked = require('../../assets/behaviour/toys unpacked.png');
const waveHello = require('../../assets/behaviour/waving hand.png');
const notWaveHello = require('../../assets/behaviour/not waving hand.png');
const queueGood = require('../../assets/behaviour/good queue.png');
const queueBad = require('../../assets/behaviour/bad queue.png');
const walkingGood = require('../../assets/behaviour/walking good.png');
const walkingBad = require('../../assets/behaviour/walking bad.png');

// ---------------------------------------------------------------------------
// ASSET MAP — keyed by assetKey. Both the ORIGINAL key names (used by the
// original seed data) and NEW descriptive aliases point at the same files,
// so it works regardless of which naming scheme the backend sends.
// ---------------------------------------------------------------------------
export const ASSET_MAP = {
  // --- original key names (kept for backend compatibility) ---
  eating_spoon_neat: eatingGood,
  eating_hands_messy: eatingBad,
  eating_sitting_table: eatingGood2,
  eating_walking_around: eatingBad2,
  hands_washing_soap: handsWashing,
  hands_dirty_reaching: handsNotWashing,
  brushing_teeth_morning: teethBrushing,
  skipping_teeth_candy: teethNotBrushing,
  sharing_toy_smiling: toySharing,
  grabbing_toy_crying: toyGrabbing,
  sharing_snack_friends: foodSharing,
  hiding_snack_alone: foodNotSharing,
  crossing_zebra_lines: roadCrossingGood,
  crossing_random_spot: roadCrossingBad,
  safety_walk_away_adult: foodChoiceGood,
  safety_taking_sweets: foodChoiceBad,
  toys_packed_box: toysPacked,
  toys_scattered_floor: toysUnpacked,
  greeting_wave_smile: waveHello,
  greeting_turning_away: notWaveHello,
  queue_standing_calm: queueGood,
  queue_pushing_front: queueBad,
  game_waiting_patiently: walkingGood,
  game_snatching_controller: walkingBad,

  // --- new descriptive aliases (same images, easier-to-read names) ---
  eating_good: eatingGood,
  eating_bad: eatingBad,
  eating_good_2: eatingGood2,
  eating_bad_2: eatingBad2,
  hands_washing: handsWashing,
  hands_not_washing: handsNotWashing,
  teeth_brushing: teethBrushing,
  teeth_not_brushing: teethNotBrushing,
  toy_sharing: toySharing,
  toy_not_sharing: toyNotSharing,
  toy_giving: toyGiving,
  toy_grabbing: toyGrabbing,
  food_sharing: foodSharing,
  food_not_sharing: foodNotSharing,
  road_crossing_good: roadCrossingGood,
  road_crossing_bad: roadCrossingBad,
  food_choice_good: foodChoiceGood,
  food_choice_bad: foodChoiceBad,
  toys_packed: toysPacked,
  toys_unpacked: toysUnpacked,
  wave_hello: waveHello,
  not_wave_hello: notWaveHello,
  queue_good: queueGood,
  queue_bad: queueBad,
  walking_good: walkingGood,
  walking_bad: walkingBad,
};

const FALLBACK_COLORS = [
  '#D6F3EC', // tealLight
  '#FBEAE3', // coralLight
  '#FCF1DC', // amberLight
  '#EFE8F7', // plumLight
  '#E1F1FA', // skyLight
];

const FALLBACK_ICONS = [
  'happy-outline',
  'heart-outline',
  'star-outline',
  'flower-outline',
  'leaf-outline',
];

/**
 * Renders the photo for a given assetKey, or a colored placeholder icon
 * (with the raw key printed underneath) if the key doesn't resolve — a
 * visible signal during dev that ASSET_MAP needs a new entry, rather than
 * a silent blank image.
 */
export default function BehaviourImage({ assetKey, style }) {
  const asset = ASSET_MAP[assetKey];

  if (asset) {
    return <Image source={asset} style={style} resizeMode="cover" />;
  }

  const color = FALLBACK_COLORS[assetKey.length % FALLBACK_COLORS.length];
  const icon = FALLBACK_ICONS[assetKey.length % FALLBACK_ICONS.length];

  return (
    <View style={[style, { backgroundColor: color, justifyContent: 'center', alignItems: 'center' }]}>
      <Ionicons name={icon} size={56} color="#1F8E7C" />
      <Text style={{ fontSize: 11, color: '#A79D94', marginTop: 8, textAlign: 'center', paddingHorizontal: 8 }}>
        {assetKey.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}