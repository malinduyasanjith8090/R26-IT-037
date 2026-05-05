// constants/learningContent.ts
export interface WordLesson {
  id: string;
  english: string;
  sinhala: string;
  emoji: string;
  category: string;
  image: string;
  description: string;
  descriptionSin: string;
}

export interface CategoryLesson {
  id: string;
  name: string;
  nameSin: string;
  icon: string;
  color: string;
  words: WordLesson[];
}

// Comprehensive learning content for autism children
export const extendedLearningContent: CategoryLesson[] = [
  {
    id: 'basic-words',
    name: 'Basic Words',
    nameSin: 'මූලික වචන',
    icon: '🔤',
    color: '#FF6B6B',
    words: [
      { 
        id: 'yes', 
        english: 'Yes', 
        sinhala: 'ඔව්', 
        emoji: '👍', 
        category: 'Basic Words', 
        image: '👍',
        description: 'To agree or say okay',
        descriptionSin: 'එකඟ වීමට හෝ හරි යැයි කීමට'
      },
      { 
        id: 'no', 
        english: 'No', 
        sinhala: 'නැත', 
        emoji: '👎', 
        category: 'Basic Words', 
        image: '👎',
        description: 'To disagree or refuse',
        descriptionSin: 'එකඟ නොවීමට හෝ ප්‍රතික්ෂේප කිරීමට'
      },
      { 
        id: 'please', 
        english: 'Please', 
        sinhala: 'කරුණාකර', 
        emoji: '🙏', 
        category: 'Basic Words', 
        image: '🙏',
        description: 'To be polite when asking',
        descriptionSin: 'ඉල්ලීමේදී ආචාරශීලී වීමට'
      },
      { 
        id: 'thank-you', 
        english: 'Thank you', 
        sinhala: 'ස්තුතියි', 
        emoji: '😊', 
        category: 'Basic Words', 
        image: '😊',
        description: 'To show appreciation',
        descriptionSin: 'කෘතඥතාව පෙන්වීමට'
      },
      { 
        id: 'sorry', 
        english: 'Sorry', 
        sinhala: 'සමාවෙන්න', 
        emoji: '🙇', 
        category: 'Basic Words', 
        image: '🙇',
        description: 'To apologize',
        descriptionSin: 'සමාව අයැදීමට'
      },
      { 
        id: 'help', 
        english: 'Help', 
        sinhala: 'උදව්', 
        emoji: '🆘', 
        category: 'Basic Words', 
        image: '🆘',
        description: 'To ask for assistance',
        descriptionSin: 'උපකාර ඉල්ලීමට'
      },
    ],
  },
  {
    id: 'feelings',
    name: 'Feelings & Emotions',
    nameSin: 'හැඟීම් සහ චිත්තවේග',
    icon: '😊',
    color: '#4ECDC4',
    words: [
      { 
        id: 'happy', 
        english: 'Happy', 
        sinhala: 'සතුටුයි', 
        emoji: '😊', 
        category: 'Feelings', 
        image: '😊',
        description: 'Feeling good and smiling',
        descriptionSin: 'හොඳක් දැනීම සහ සිනහවීම'
      },
      { 
        id: 'sad', 
        english: 'Sad', 
        sinhala: 'දුකයි', 
        emoji: '😢', 
        category: 'Feelings', 
        image: '😢',
        description: 'Feeling down or upset',
        descriptionSin: 'දුක්බර හෝ කලබලකාරී දැනීම'
      },
      { 
        id: 'angry', 
        english: 'Angry', 
        sinhala: 'තරහයි', 
        emoji: '😠', 
        category: 'Feelings', 
        image: '😠',
        description: 'Feeling frustrated or mad',
        descriptionSin: 'කලකිරීම හෝ උමතු වීම'
      },
      { 
        id: 'scared', 
        english: 'Scared', 
        sinhala: 'බයයි', 
        emoji: '😨', 
        category: 'Feelings', 
        image: '😨',
        description: 'Feeling afraid',
        descriptionSin: 'බිය දැනීම'
      },
      { 
        id: 'excited', 
        english: 'Excited', 
        sinhala: 'උද්යෝගිමත්', 
        emoji: '🤩', 
        category: 'Feelings', 
        image: '🤩',
        description: 'Looking forward to something',
        descriptionSin: 'යමක් අපේක්ෂා කිරීම'
      },
      { 
        id: 'calm', 
        english: 'Calm', 
        sinhala: 'සන්සුන්', 
        emoji: '😌', 
        category: 'Feelings', 
        image: '😌',
        description: 'Peaceful and relaxed',
        descriptionSin: 'සාමකාමී සහ සැහැල්ලු'
      },
      { 
        id: 'loved', 
        english: 'Loved', 
        sinhala: 'ආදරය', 
        emoji: '🥰', 
        category: 'Feelings', 
        image: '🥰',
        description: 'Feeling cared for',
        descriptionSin: 'රැකවරණය දැනීම'
      },
      { 
        id: 'tired', 
        english: 'Tired', 
        sinhala: 'මහන්සියි', 
        emoji: '😴', 
        category: 'Feelings', 
        image: '😴',
        description: 'Need to rest',
        descriptionSin: 'විවේකය අවශ්‍යයි'
      },
    ],
  },
  {
    id: 'family',
    name: 'Family Members',
    nameSin: 'පවුලේ සාමාජිකයන්',
    icon: '👨‍👩‍👧‍👦',
    color: '#FFD166',
    words: [
      { 
        id: 'mother', 
        english: 'Mother', 
        sinhala: 'අම්මා', 
        emoji: '👩', 
        category: 'Family', 
        image: '👩',
        description: 'Your mom who takes care of you',
        descriptionSin: 'ඔබව රැකබලා ගන්නා ඔබේ අම්මා'
      },
      { 
        id: 'father', 
        english: 'Father', 
        sinhala: 'තාත්තා', 
        emoji: '👨', 
        category: 'Family', 
        image: '👨',
        description: 'Your dad who loves you',
        descriptionSin: 'ඔබට ආදරය කරන ඔබේ තාත්තා'
      },
      { 
        id: 'brother', 
        english: 'Brother', 
        sinhala: 'සහෝදරයා', 
        emoji: '👦', 
        category: 'Family', 
        image: '👦',
        description: 'A boy sibling',
        descriptionSin: 'පිරිමි සහෝදරයෙක්'
      },
      { 
        id: 'sister', 
        english: 'Sister', 
        sinhala: 'සහෝදරිය', 
        emoji: '👧', 
        category: 'Family', 
        image: '👧',
        description: 'A girl sibling',
        descriptionSin: 'ගැහැණු සහෝදරියක්'
      },
      { 
        id: 'grandma', 
        english: 'Grandmother', 
        sinhala: 'ආච්චි', 
        emoji: '👵', 
        category: 'Family', 
        image: '👵',
        description: 'Your mom or dad\'s mom',
        descriptionSin: 'ඔබේ අම්මා හෝ තාත්තාගේ අම්මා'
      },
      { 
        id: 'grandpa', 
        english: 'Grandfather', 
        sinhala: 'සීයා', 
        emoji: '👴', 
        category: 'Family', 
        image: '👴',
        description: 'Your mom or dad\'s dad',
        descriptionSin: 'ඔබේ අම්මා හෝ තාත්තාගේ තාත්තා'
      },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    nameSin: 'ආහාර පාන',
    icon: '🍕',
    color: '#06D6A0',
    words: [
      { 
        id: 'apple', 
        english: 'Apple', 
        sinhala: 'ඇපල්', 
        emoji: '🍎', 
        category: 'Food', 
        image: '🍎',
        description: 'A red or green fruit',
        descriptionSin: 'රතු හෝ කොළ පැහැති පලතුරක්'
      },
      { 
        id: 'banana', 
        english: 'Banana', 
        sinhala: 'කෙසෙල්', 
        emoji: '🍌', 
        category: 'Food', 
        image: '🍌',
        description: 'A yellow fruit that monkeys love',
        descriptionSin: 'වඳුරන්ට ආදරය කරන කහ පැහැති පලතුරක්'
      },
      { 
        id: 'water', 
        english: 'Water', 
        sinhala: 'වතුර', 
        emoji: '💧', 
        category: 'Food', 
        image: '💧',
        description: 'Drink to stay hydrated',
        descriptionSin: 'ජලය පානය කිරීම සජලනය වීමට'
      },
      { 
        id: 'milk', 
        english: 'Milk', 
        sinhala: 'කිරි', 
        emoji: '🥛', 
        category: 'Food', 
        image: '🥛',
        description: 'White drink from cows',
        descriptionSin: 'එළදෙනුන්ගෙන් ලැබෙන සුදු පැහැති පානය'
      },
      { 
        id: 'bread', 
        english: 'Bread', 
        sinhala: 'පාන්', 
        emoji: '🍞', 
        category: 'Food', 
        image: '🍞',
        description: 'Soft food made from flour',
        descriptionSin: 'පිටි වලින් සාදන ලද මෘදු ආහාරයක්'
      },
      { 
        id: 'rice', 
        english: 'Rice', 
        sinhala: 'බත්', 
        emoji: '🍚', 
        category: 'Food', 
        image: '🍚',
        description: 'Main food in Sri Lanka',
        descriptionSin: 'ශ්‍රී ලංකාවේ ප්‍රධාන ආහාරය'
      },
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    nameSin: 'සත්වයින්',
    icon: '🐶',
    color: '#118AB2',
    words: [
      { 
        id: 'dog', 
        english: 'Dog', 
        sinhala: 'බල්ලා', 
        emoji: '🐕', 
        category: 'Animals', 
        image: '🐕',
        description: 'A friendly pet that barks',
        descriptionSin: 'බුරන ප්‍රේමණීය සුරතල් සතෙක්'
      },
      { 
        id: 'cat', 
        english: 'Cat', 
        sinhala: 'බළලා', 
        emoji: '🐱', 
        category: 'Animals', 
        image: '🐱',
        description: 'A soft pet that meows',
        descriptionSin: 'මියවන මෘදු සුරතල් සතෙක්'
      },
      { 
        id: 'bird', 
        english: 'Bird', 
        sinhala: 'කුරුල්ලා', 
        emoji: '🐦', 
        category: 'Animals', 
        image: '🐦',
        description: 'An animal that flies',
        descriptionSin: 'පියාසර කරන සතෙක්'
      },
      { 
        id: 'fish', 
        english: 'Fish', 
        sinhala: 'මාළුවා', 
        emoji: '🐟', 
        category: 'Animals', 
        image: '🐟',
        description: 'Lives in water and swims',
        descriptionSin: 'ජලයේ ජීවත් වන සහ පිහිනන සතෙක්'
      },
      { 
        id: 'rabbit', 
        english: 'Rabbit', 
        sinhala: 'හාවා', 
        emoji: '🐰', 
        category: 'Animals', 
        image: '🐰',
        description: 'A fluffy animal with long ears',
        descriptionSin: 'දිගු කන් ඇති සුදුමැලි සතෙක්'
      },
      { 
        id: 'butterfly', 
        english: 'Butterfly', 
        sinhala: 'සමනලයා', 
        emoji: '🦋', 
        category: 'Animals', 
        image: '🦋',
        description: 'A colorful flying insect',
        descriptionSin: 'වර්ණවත් පියාසර කෘමියෙක්'
      },
    ],
  },
  {
    id: 'daily-activities',
    name: 'Daily Activities',
    nameSin: 'දෛනික ක්‍රියාකාරකම්',
    icon: '🚽',
    color: '#EF476F',
    words: [
      { 
        id: 'eat', 
        english: 'Eat', 
        sinhala: 'කනවා', 
        emoji: '🍽️', 
        category: 'Activities', 
        image: '🍽️',
        description: 'To have food',
        descriptionSin: 'ආහාර ගැනීම'
      },
      { 
        id: 'drink', 
        english: 'Drink', 
        sinhala: 'බොනවා', 
        emoji: '🥤', 
        category: 'Activities', 
        image: '🥤',
        description: 'To have liquid',
        descriptionSin: 'දියර පානය කිරීම'
      },
      { 
        id: 'sleep', 
        english: 'Sleep', 
        sinhala: 'නිදාගන්නවා', 
        emoji: '😴', 
        category: 'Activities', 
        image: '😴',
        description: 'To rest your body',
        descriptionSin: 'ඔබේ සිරුර විවේක ගැනීම'
      },
      { 
        id: 'bath', 
        english: 'Take a bath', 
        sinhala: 'නානවා', 
        emoji: '🛁', 
        category: 'Activities', 
        image: '🛁',
        description: 'To clean your body',
        descriptionSin: 'ඔබේ සිරුර පිරිසිදු කිරීම'
      },
      { 
        id: 'play', 
        english: 'Play', 
        sinhala: 'සෙල්ලම් කරනවා', 
        emoji: '🎮', 
        category: 'Activities', 
        image: '🎮',
        description: 'To have fun with toys',
        descriptionSin: 'සෙල්ලම් බඩු සමග විනෝද වීම'
      },
      { 
        id: 'study', 
        english: 'Study', 
        sinhala: 'ඉගෙනගන්නවා', 
        emoji: '📚', 
        category: 'Activities', 
        image: '📚',
        description: 'To learn new things',
        descriptionSin: 'අලුත් දේවල් ඉගෙන ගැනීම'
      },
    ],
  },
  {
    id: 'places',
    name: 'Places',
    nameSin: 'ස්ථාන',
    icon: '🏠',
    color: '#FFB347',
    words: [
      { 
        id: 'home', 
        english: 'Home', 
        sinhala: 'ගෙදර', 
        emoji: '🏠', 
        category: 'Places', 
        image: '🏠',
        description: 'Where you live with family',
        descriptionSin: 'ඔබ පවුල සමග ජීවත් වන ස්ථානය'
      },
      { 
        id: 'school', 
        english: 'School', 
        sinhala: 'පාසල', 
        emoji: '🏫', 
        category: 'Places', 
        image: '🏫',
        description: 'Where you learn and play',
        descriptionSin: 'ඔබ ඉගෙන ගන්නා සහ සෙල්ලම් කරන ස්ථානය'
      },
      { 
        id: 'park', 
        english: 'Park', 
        sinhala: 'උද්‍යානය', 
        emoji: '🏞️', 
        category: 'Places', 
        image: '🏞️',
        description: 'Green area with trees and swings',
        descriptionSin: 'ගස් සහ පැද්දීම් සහිත හරිත ප්‍රදේශය'
      },
      { 
        id: 'hospital', 
        english: 'Hospital', 
        sinhala: 'රෝහල', 
        emoji: '🏥', 
        category: 'Places', 
        image: '🏥',
        description: 'Where doctors help sick people',
        descriptionSin: 'වෛද්‍යවරුන් රෝගීන්ට උදව් කරන ස්ථානය'
      },
      { 
        id: 'store', 
        english: 'Store', 
        sinhala: 'සාප්පුව', 
        emoji: '🏪', 
        category: 'Places', 
        image: '🏪',
        description: 'Where you buy food and things',
        descriptionSin: 'ඔබ ආහාර සහ භාණ්ඩ මිලදී ගන්නා ස්ථානය'
      },
      { 
        id: 'temple', 
        english: 'Temple', 
        sinhala: 'පන්සල', 
        emoji: '🛕', 
        category: 'Places', 
        image: '🛕',
        description: 'Place of worship',
        descriptionSin: 'නමස්කාර ස්ථානය'
      },
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    nameSin: 'වාහන',
    icon: '🚗',
    color: '#6C5CE7',
    words: [
      { 
        id: 'car', 
        english: 'Car', 
        sinhala: 'කාර් එක', 
        emoji: '🚗', 
        category: 'Vehicles', 
        image: '🚗',
        description: 'A vehicle that drives on roads',
        descriptionSin: 'පාරවල් මත ධාවනය වන වාහනයක්'
      },
      { 
        id: 'bus', 
        english: 'Bus', 
        sinhala: 'බස් එක', 
        emoji: '🚌', 
        category: 'Vehicles', 
        image: '🚌',
        description: 'Big vehicle that carries many people',
        descriptionSin: 'බොහෝ අය රැගෙන යන විශාල වාහනය'
      },
      { 
        id: 'train', 
        english: 'Train', 
        sinhala: 'දුම්රිය', 
        emoji: '🚂', 
        category: 'Vehicles', 
        image: '🚂',
        description: 'Long vehicle on tracks',
        descriptionSin: 'දුම්රිය මාර්ගයේ ධාවනය වන දිගු වාහනය'
      },
      { 
        id: 'bicycle', 
        english: 'Bicycle', 
        sinhala: 'බයිසිකලය', 
        emoji: '🚲', 
        category: 'Vehicles', 
        image: '🚲',
        description: 'Two-wheeled vehicle you pedal',
        descriptionSin: 'ඔබ පැදවිය යුතු දෙරෝද වාහනය'
      },
      { 
        id: 'airplane', 
        english: 'Airplane', 
        sinhala: 'ගුවන් යානය', 
        emoji: '✈️', 
        category: 'Vehicles', 
        image: '✈️',
        description: 'Vehicle that flies in the sky',
        descriptionSin: 'අහසේ පියාසර කරන වාහනය'
      },
      { 
        id: 'boat', 
        english: 'Boat', 
        sinhala: 'බෝට්ටුව', 
        emoji: '⛵', 
        category: 'Vehicles', 
        image: '⛵',
        description: 'Vehicle that sails on water',
        descriptionSin: 'ජලය මත යාත්‍රා කරන වාහනය'
      },
    ],
  },
  {
    id: 'weather',
    name: 'Weather & Nature',
    nameSin: 'කාලගුණය සහ ස්වභාවය',
    icon: '☀️',
    color: '#00CEC9',
    words: [
      { 
        id: 'sun', 
        english: 'Sun', 
        sinhala: 'හිරු', 
        emoji: '☀️', 
        category: 'Weather', 
        image: '☀️',
        description: 'Bright yellow in the sky',
        descriptionSin: 'අහසේ දීප්තිමත් කහ පැහැය'
      },
      { 
        id: 'rain', 
        english: 'Rain', 
        sinhala: 'වැස්ස', 
        emoji: '🌧️', 
        category: 'Weather', 
        image: '🌧️',
        description: 'Water falling from clouds',
        descriptionSin: 'වලාකුළු වලින් ජලය වැටීම'
      },
      { 
        id: 'cloud', 
        english: 'Cloud', 
        sinhala: 'වලාකුළ', 
        emoji: '☁️', 
        category: 'Weather', 
        image: '☁️',
        description: 'Fluffy white in the sky',
        descriptionSin: 'අහසේ සුදුමැලි පුළුන්'
      },
      { 
        id: 'wind', 
        english: 'Wind', 
        sinhala: 'හුළඟ', 
        emoji: '💨', 
        category: 'Weather', 
        image: '💨',
        description: 'Moving air',
        descriptionSin: 'චලනය වන වාතය'
      },
      { 
        id: 'flower', 
        english: 'Flower', 
        sinhala: 'මල', 
        emoji: '🌸', 
        category: 'Weather', 
        image: '🌸',
        description: 'Colorful plant that smells nice',
        descriptionSin: 'සුවඳැති වර්ණවත් පැළෑටිය'
      },
      { 
        id: 'tree', 
        english: 'Tree', 
        sinhala: 'ගස', 
        emoji: '🌳', 
        category: 'Weather', 
        image: '🌳',
        description: 'Tall plant with leaves',
        descriptionSin: 'කොළ සහිත උස් පැළෑටිය'
      },
    ],
  },
];