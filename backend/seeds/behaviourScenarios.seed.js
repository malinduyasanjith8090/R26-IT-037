/**
 * behaviourScenarios.seed.js
 *
 * Seeds the 13 picture-choice behaviour scenarios.
 *
 * Each scenario contains exactly 2 images:
 *   - one encouraged / good behaviour
 *   - one alternative behaviour
 *
 * The assetKey values MUST match the keys used by
 * BehaviourGame.tsx.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const BehaviourScenario = require('../models/BehaviourScenario');

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.argv[2];

if (!MONGO_URI) {
  console.error(
    '\n❌ Missing MongoDB URI.\n' +
    'Set MONGO_URI in .env or pass it as a CLI argument.\n'
  );

  process.exit(1);
}


/* ============================================================================
   13 BEHAVIOUR SCENARIOS
   ========================================================================== */

const scenarios = [

  // --------------------------------------------------------------------------
  // 1. EATING HABITS
  // --------------------------------------------------------------------------
  {
    name: 'eating_utensil_vs_hands',

    prompt: {
      en: 'Which one shows good eating?',
      si: 'හොඳ ආහාර ගැනීම කුමක්ද?',
    },

    category: 'eating_habits',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'eating_good',
        label: 'Eating neatly',
        isCorrect: true,
      },
      {
        assetKey: 'eating_bad',
        label: 'Eating messily',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 2. EATING WHILE SITTING
  // --------------------------------------------------------------------------
  {
    name: 'eating_sitting_vs_walking',

    prompt: {
      en: 'Where should we eat our food?',
      si: 'කෑම කෑමට හොඳ තැන කුමක්ද?',
    },

    category: 'eating_habits',
    difficulty: 2,

    ageGroup: {
      min: 4,
      max: 12,
    },

    images: [
      {
        assetKey: 'food_choice_good',
        label: 'Sitting properly while eating',
        isCorrect: true,
      },
      {
        assetKey: 'food_choice_bad',
        label: 'Walking while eating',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 3. WASHING HANDS
  // --------------------------------------------------------------------------
  {
    name: 'handwash_vs_dirty_hands',

    prompt: {
      en: 'What do we do before eating?',
      si: 'කෑමට පෙර අපි කුමක් කරමු?',
    },

    category: 'hygiene',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'washing_hands',
        label: 'Washing hands',
        isCorrect: true,
      },
      {
        assetKey: 'not_washing_hands',
        label: 'Not washing hands',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 4. BRUSHING TEETH
  // --------------------------------------------------------------------------
  {
    name: 'brushing_teeth_vs_skipping',

    prompt: {
      en: 'Which one keeps teeth healthy?',
      si: 'දත් සෞඛ්‍ය සම්පන්නව තබා ගන්නේ කෙසේද?',
    },

    category: 'hygiene',
    difficulty: 2,

    ageGroup: {
      min: 4,
      max: 12,
    },

    images: [
      {
        assetKey: 'brushing_teeth',
        label: 'Brushing teeth',
        isCorrect: true,
      },
      {
        assetKey: 'not_brushing_teeth',
        label: 'Not brushing teeth',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 5. SHARING TOYS
  // --------------------------------------------------------------------------
  {
    name: 'sharing_toy_vs_grabbing',

    prompt: {
      en: 'Which child is being kind?',
      si: 'කුමන දරුවා කාරුණික ද?',
    },

    category: 'sharing',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'toy_sharing',
        label: 'Sharing a toy',
        isCorrect: true,
      },
      {
        assetKey: 'toy_grabbing',
        label: 'Grabbing a toy',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 6. SHARING FOOD
  // --------------------------------------------------------------------------
  {
    name: 'sharing_snack_vs_hiding',

    prompt: {
      en: 'What is the good thing to do with food?',
      si: 'ආහාර සමඟ කළ යුතු හොඳ දෙය කුමක්ද?',
    },

    category: 'sharing',
    difficulty: 2,

    ageGroup: {
      min: 4,
      max: 12,
    },

    images: [
      {
        assetKey: 'food_sharing',
        label: 'Sharing food',
        isCorrect: true,
      },
      {
        assetKey: 'food_not_sharing',
        label: 'Not sharing food',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 7. ROAD CROSSING
  // --------------------------------------------------------------------------
  {
    name: 'road_crossing_zebra_vs_random',

    prompt: {
      en: 'Where is the safe place to cross the road?',
      si: 'පාර හරහා යාමට ආරක්ෂිත තැන කුමක්ද?',
    },

    category: 'safety',
    difficulty: 1,

    ageGroup: {
      min: 4,
      max: 12,
    },

    images: [
      {
        assetKey: 'road_crossing_good',
        label: 'Crossing at a safe place',
        isCorrect: true,
      },
      {
        assetKey: 'road_crossing_bad',
        label: 'Crossing at an unsafe place',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 8. STRANGER SAFETY
  // --------------------------------------------------------------------------
  {
    name: 'stranger_danger_vs_talking',

    prompt: {
      en: 'What should you do if a stranger offers you sweets?',
      si: 'අමුතු කෙනෙකු රසකැවිලි දෙන්නට හදන්නේ නම් කුමක් කළ යුතු ද?',
    },

    category: 'safety',
    difficulty: 3,

    ageGroup: {
      min: 5,
      max: 12,
    },

    images: [
      {
        assetKey: 'walking_good',
        label: 'Walking away from a stranger',
        isCorrect: true,
      },
      {
        assetKey: 'walking_bad',
        label: 'Going with a stranger',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 9. PACKING TOYS
  // --------------------------------------------------------------------------
  {
    name: 'toys_packed_vs_scattered',

    prompt: {
      en: 'What should we do with toys after playing?',
      si: 'සෙල්ලම් කිරීමෙන් පසු සෙල්ලම් බඩු සමඟ කුමක් කළ යුතු ද?',
    },

    category: 'tidying_up',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'toys_packed',
        label: 'Packing toys away',
        isCorrect: true,
      },
      {
        assetKey: 'toys_unpacked',
        label: 'Leaving toys scattered',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 10. GREETING
  // --------------------------------------------------------------------------
  {
    name: 'greeting_wave_vs_ignore',

    prompt: {
      en: 'What do we do when we see someone we know?',
      si: 'හඳුනන කෙනෙකු දුටු විට අපි කුමක් කරමු?',
    },

    category: 'greeting',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'wave_hello',
        label: 'Waving hello',
        isCorrect: true,
      },
      {
        assetKey: 'not_wave_hello',
        label: 'Ignoring someone',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 11. WAITING IN A QUEUE
  // --------------------------------------------------------------------------
  {
    name: 'queue_waiting_vs_pushing',

    prompt: {
      en: 'How do we wait for our turn?',
      si: 'අපේ වාරය බලා සිටින්නේ කෙසේද?',
    },

    category: 'waiting_turns',
    difficulty: 1,

    ageGroup: {
      min: 3,
      max: 10,
    },

    images: [
      {
        assetKey: 'queue_good',
        label: 'Waiting calmly in line',
        isCorrect: true,
      },
      {
        assetKey: 'queue_bad',
        label: 'Pushing in front',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 12. WAITING FOR GAME TURN
  // --------------------------------------------------------------------------
  {
    name: 'game_waiting_turn_vs_snatching',

    prompt: {
      en: 'Whose turn is it to play?',
      si: 'සෙල්ලම් කිරීමට කාගේ වාරය ද?',
    },

    category: 'waiting_turns',
    difficulty: 2,

    ageGroup: {
      min: 4,
      max: 12,
    },

    images: [
      {
        assetKey: 'game_waiting_patiently',
        label: 'Waiting patiently for a turn',
        isCorrect: true,
      },
      {
        assetKey: 'game_snatching_controller',
        label: 'Snatching the game',
        isCorrect: false,
      },
    ],

    isActive: true,
  },


  // --------------------------------------------------------------------------
  // 13. GIVING / SHARING TOYS
  // --------------------------------------------------------------------------
  {
    name: 'giving_toy_vs_not_sharing',

    prompt: {
      en: 'Which one shows good sharing?',
      si: 'හොඳින් බෙදා ගැනීම පෙන්වන්නේ කුමක්ද?',
    },

    category: 'sharing',
    difficulty: 2,

    ageGroup: {
      min: 3,
      max: 12,
    },

    images: [
      {
        assetKey: 'toy_giving',
        label: 'Giving a toy to another child',
        isCorrect: true,
      },
      {
        assetKey: 'toy_not_sharing',
        label: 'Not sharing toys',
        isCorrect: false,
      },
    ],

    isActive: true,
  },

];


/* ============================================================================
   SEED DATABASE
   ========================================================================== */

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('✅ Connected to MongoDB');
    console.log(`📦 Processing ${scenarios.length} behaviour scenarios...\n`);

    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const data of scenarios) {

      const result = await BehaviourScenario.updateOne(
        { name: data.name },
        { $set: data },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`✅ Created: ${data.name}`);
        created++;
      } else if (result.modifiedCount > 0) {
        console.log(`🔄 Updated: ${data.name}`);
        updated++;
      } else {
        console.log(`⏭  Unchanged: ${data.name}`);
        unchanged++;
      }
    }

    console.log('\n────────────────────────────────────');
    console.log('🌱 Behaviour scenario seed complete');
    console.log(`   Total scenarios: ${scenarios.length}`);
    console.log(`   Created:         ${created}`);
    console.log(`   Updated:         ${updated}`);
    console.log(`   Unchanged:       ${unchanged}`);
    console.log('────────────────────────────────────\n');

    process.exit(0);

  } catch (err) {

    console.error('\n❌ Seed failed:');
    console.error(err);

    process.exit(1);
  }
}

seed();