// context/LanguageContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type LanguageType = 'en' | 'si' | 'ta';

interface LanguageContextType {
  language: LanguageType;
  t: (key: string, params?: Record<string, any>) => string;
  setLanguage: (lang: LanguageType) => void;
}

const translations = {
  en: {
    // Common
    welcome: 'Welcome',
    getStarted: 'Get Started',
    iAlreadyHaveAccount: 'I Already Have an Account',
    skip: 'Skip',
    next: 'Next',
    back: 'Back',
    done: 'Done',
    save: 'Save',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    // Auth
    login: 'Login',
    signup: 'Sign Up',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    continueAsGuest: 'Continue as Guest',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccountYes: 'Already have an account?',
    register: 'Register',

    // Onboarding
    personalizedLearning: 'Personalized Learning',
    personalizedLearningDesc: 'Adaptive lessons that match your child\'s unique abilities and interests',
    safeSocialPractice: 'Safe Social Practice',
    safeSocialPracticeDesc: 'Practice social skills in virtual environments without real-world pressure',
    dailyRoutineSupport: 'Daily Routine Support',
    dailyRoutineSupportDesc: 'Visual schedules and gentle reminders for smooth daily transitions',
    funEducationalGames: 'Fun Educational Games',
    funEducationalGamesDesc: 'Engaging games that build confidence and cognitive skills',

    // Dashboard
    dashboard: 'Dashboard',
    hello: 'Hello',
    readyToLearn: 'Ready to learn and grow today?',
    todaysProgress: 'Today\'s Progress',
    learning: 'Learning',
    games: 'Games',
    routine: 'Routine',
    socialSkills: 'Social Skills',
    quickActions: 'Quick Actions',
    continueLearning: 'Continue Learning',
    playGames: 'Play Games',
    dailyRoutine: 'Daily Routine',
    todaysTasks: 'Today\'s Tasks',
    morningRoutine: 'Morning Routine',
    learningSession: 'Learning Session',
    lunchTime: 'Lunch Time',
    gameTime: 'Game Time',
    eveningRoutine: 'Evening Routine',
    recentAchievements: 'Recent Achievements',
    learnedNewWords: 'Learned 10 New Words',
    completedGames: 'Completed 5 Games',
    dayStreak: '7 Day Streak',
    parentTip: 'Parent Tip of the Day',
    parentTipText: '"Remember to celebrate small victories! Each step forward, no matter how small, is progress worth acknowledging."',

    // Learning Screen
    learningJourney: 'Learning Journey',
    exploreLessons: 'Explore lessons at your own pace',
    continueLearningPickup: 'Continue Learning',
    pickUpWhereLeft: 'Pick up where you left off',
    letterAApple: 'Letter A - Apple',
    learningWordsWithA: 'Learning words starting with A',
    learningCategories: 'Learning Categories',
    lettersNumbers: 'Letters & Numbers',
    colorsShapes: 'Colors & Shapes',
    dailyActivities: 'Daily Activities',
    animalsNature: 'Animals & Nature',
    emotions: 'Emotions',
    socialStories: 'Social Stories',
    recommendedForYou: 'Recommended for You',
    interactiveStory: 'Interactive Story: The Friendly Dragon',
    countingWithColors: 'Counting with Colors',
    emotionMatchingGame: 'Emotion Matching Game',
    arLearning: 'AR Learning',
    bringLessonsToLife: 'Bring lessons to life with Augmented Reality',
    startArExperience: 'Start AR Experience',
    lessons: 'Lessons',
    completed: 'Completed',

    // Games Screen
    funGames: 'Fun Games',
    playLearnGrow: 'Play, learn, and grow!',
    dailyChallenge: 'Daily Challenge',
    completeForRewards: 'Complete for bonus rewards',
    completeMemoryGames: 'Complete 3 Memory Games',
    rewardStars: 'Reward: 50 Stars',
    progress: 'Progress',
    playNow: 'Play Now',
    allGames: 'All Games',
    memoryMatch: 'Memory Match',
    matchPairs: 'Match pairs of cards',
    colorSorting: 'Color Sorting',
    sortObjectsByColor: 'Sort objects by color',
    shapePuzzle: 'Shape Puzzle',
    completeShapePuzzles: 'Complete shape puzzles',
    emotionMatch: 'Emotion Match',
    matchFacesWithEmotions: 'Match faces with emotions',
    patternMaker: 'Pattern Maker',
    createPatterns: 'Create patterns',
    numberHunt: 'Number Hunt',
    findHiddenNumbers: 'Find hidden numbers',
    recentlyPlayed: 'Recently Played',
    playedAgo: 'Played 2 hours ago',
    filterByCategory: 'Filter by Category:',
    all: 'All',
    memory: 'Memory',
    puzzle: 'Puzzle',
    educational: 'Educational',
    fun: 'Fun',
    socialCat: 'Social',
    difficulty: 'Difficulty',
    stars: 'Stars',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',

    // Game Messages
    gameUnderDevelopment: 'This game is under development. Stay tuned!',
    comingSoon: 'Coming Soon!',
    question: 'Question',
    score: 'Score',
    levelComplete: 'Level Complete!',
    gameComplete: 'Game Complete!',
    congratulations: 'Congratulations!',
    tryAgain: 'Try Again!',
    correct: 'Correct!',
    incorrect: 'Incorrect!',

    // More additions for games
    oddOneOut: 'Odd One Out',
    whatComesNext: 'What Comes Next?',
    sortingGame: 'Sorting Game',
    wordAnalogies: 'Word Analogies',
    traceLetter: 'Trace Letter',
    traceNumber: 'Trace Number',
    arExperience: 'AR Experience',

    // Rewards and Feedback
    greatJob: 'Great Job!',
    excellentWork: 'Excellent Work!',
    keepPracticing: 'Keep practicing!',
    youCanDoIt: 'You can do it!',
    almostThere: 'Almost there!',
    perfectScoreMessage: 'Perfect score! You mastered this!',

    // Routine Screen
    dailyRoutineTitle: 'Daily Routine',
    todaysSchedule: 'Today\'s Schedule',
    currentActivity: 'Current Activity',
    completeDailyLessons: 'Complete your daily lessons',
    start: 'Start',
    dailyProgress: 'Daily Progress',
    tasksCompleted: 'tasks completed',
    wakeUp: 'Wake Up',
    brushTeeth: 'Brush Teeth',
    breakfast: 'Breakfast',
    learningTime: 'Learning Time',
    playTime: 'Play Time',
    lunch: 'Lunch',
    quietTime: 'Quiet Time',
    outdoorPlay: 'Outdoor Play',
    dinner: 'Dinner',
    bedtime: 'Bedtime',
    upcoming: 'Upcoming',
    addCustomActivity: 'Add Custom Activity',
    routineTips: 'Routine Tips',
    visualTimers: 'Use visual timers to help with transitions',
    minuteWarnings: 'Give 5-minute warnings before activity changes',
    celebrateCompleting: 'Celebrate completing each task with praise',
    keepRoutinesConsistent: 'Keep routines consistent but flexible',

    // Behavioral Screen
    socialSkillsTraining: 'Social Skills Training',
    practiceVirtualEnvironments: 'Practice in safe virtual environments',
    virtualRealityPractice: 'Virtual Reality Practice',
    safeEnvironmentPractice: 'Safe environment for social practice',
    currentScenario: 'Current Scenario: Playing at Park',
    practiceGreetingFriends: 'Practice greeting friends and sharing toys',
    startVrSession: 'Start VR Session',
    emotionRecognition: 'Emotion Recognition',
    identifyDifferentEmotions: 'Learn to identify different emotions',
    tapToSelect: 'Tap to select the emotion:',
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    scared: 'Scared',
    excited: 'Excited',
    calm: 'Calm',
    greatYouSelected: 'Great! You selected',
    socialScenarios: 'Social Scenarios',
    greetingFriends: 'Greeting Friends',
    learnHelloGoodbye: 'Learn to say hello and goodbye',
    sharingToys: 'Sharing Toys',
    practiceTakingTurns: 'Practice taking turns',
    understandingEmotions: 'Understanding Emotions',
    recognizeDifferentFeelings: 'Recognize different feelings',
    playingTogether: 'Playing Together',
    groupPlayActivities: 'Group play activities',
    dealingWithAnger: 'Dealing with Anger',
    calmDownStrategies: 'Calm down strategies',
    publicPlaces: 'Public Places',
    behaviorStoresParks: 'Behavior in stores and parks',
    progressTracking: 'Progress Tracking',
    communication: 'Communication',
    socialSkillsTips: 'Social Skills Tips',
    useSimpleLanguage: 'Use simple, clear language',
    practiceVisualAids: 'Practice with visual aids',
    roleplayScenarios: 'Role-play different scenarios',
    positiveReinforcement: 'Provide positive reinforcement',
    patientConsistent: 'Be patient and consistent',

    // Settings
    settings: 'Settings',
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    english: 'English',
    sinhala: 'Sinhala',
    tamil: 'Tamil',
    profile: 'Profile',
    logout: 'Logout',
    editProfile: 'Edit Profile',
    childName: "Child's Name",
    childAge: "Child's Age",
    parentName: "Parent's Name",
    phone: 'Phone Number',
    notificationsDesc: 'Receive updates about child progress',
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    soundAlerts: 'Sound Alerts',
    vibration: 'Vibration',
    systemDefault: 'System Default',
    selectLanguage: 'Select Language',
    selectTheme: 'Select Theme',
    about: 'About',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    help: 'Help',
    contactSupport: 'Contact Support',
    version: 'Version',
    areYouSureLogout: 'Are you sure you want to logout?',
    profileUpdated: 'Profile updated successfully!',

    // Profile
    changePhoto: 'Change Photo',
    childInformation: 'Child Information',
    age: 'Age',
    gender: 'Gender',
    years: 'years',
    appSettings: 'App Settings',
    manageSettings: 'Manage notifications, language, theme and more',

    // ─── ADDITIONAL KEYS FOR LEARNING SCREENS ───
    alreadyHaveAccount: 'Already have an account?',
    colors: 'Colors',
    'progress.of': '{current} of {total} {item}',

    // Color instruction & names
    'color.instruction': 'Choose the color shown below',
    'color.red': 'Red',
    'color.blue': 'Blue',
    'color.green': 'Green',
    'color.yellow': 'Yellow',
    'color.orange': 'Orange',
    'color.purple': 'Purple',
    'color.pink': 'Pink',
    'color.brown': 'Brown',
    'color.black': 'Black',
    'color.white': 'White',

    // Objects for colors
    'object.apple': 'Apple',
    'object.rose': 'Rose',
    'object.ball': 'Ball',
    'object.sky': 'Sky',
    'object.ocean': 'Ocean',
    'object.blueberry': 'Blueberry',
    'object.grass': 'Grass',
    'object.tree': 'Tree',
    'object.leaf': 'Leaf',
    'object.sun': 'Sun',
    'object.banana': 'Banana',
    'object.star': 'Star',
    'object.orangeFruit': 'Orange',
    'object.pumpkin': 'Pumpkin',
    'object.carrot': 'Carrot',
    'object.grapes': 'Grapes',
    'object.eggplant': 'Eggplant',
    'object.lavender': 'Lavender',
    'object.flower': 'Flower',
    'object.cottonCandy': 'Cotton Candy',
    'object.pig': 'Pig',
    'object.chocolate': 'Chocolate',
    'object.treeTrunk': 'Tree Trunk',
    'object.bear': 'Bear',
    'object.nightSky': 'Night Sky',
    'object.penguin': 'Penguin',
    'object.tire': 'Tire',
    'object.cloud': 'Cloud',
    'object.snow': 'Snow',
    'object.milk': 'Milk',

    // Color UI
    'color.thingsThatAre': 'Things that are {color}:',
    'color.whatColorIsThis': 'What color is this?',
    'color.tryAgainCorrectIs': 'Try again! The correct color is {color}!',

    // Reward messages (colors)
    'reward.amazing': '🌟 Amazing! 🌟',
    'reward.greatJob': '🎉 Great Job! 🎉',
    'reward.youreAStar': '⭐ You\'re a Star! ⭐',
    'reward.fantastic': '🎈 Fantastic! 🎈',
    'reward.excellent': '🏆 Excellent! 🏆',
    'reward.keepGoing': '💪 Keep Going! 💪',
    'reward.beautiful': '🌈 Beautiful! 🌈',
    'reward.completeAllColors': '🎉 Complete! You mastered all colors! 🎉',
    'reward.youAreColorMaster': '🎉 You are a Color Master! 🎉',
    'reward.pointsForColor': '+{points} points for {color}!',
    'reward.greatProgress': 'Great progress! Keep going!',

    // Common UI
    'common.backToMenu': 'Back to Menu',
    'common.continue': 'Continue',

    // Animal instruction & names
    'animal.instruction': 'Choose the animal shown below',
    'animal.lion': 'Lion',
    'animal.elephant': 'Elephant',
    'animal.monkey': 'Monkey',
    'animal.giraffe': 'Giraffe',
    'animal.panda': 'Panda',
    'animal.dolphin': 'Dolphin',

    // Shape instruction & names
    'shape.instruction': 'Choose the shape shown below',
    'shape.circle': 'Circle',
    'shape.square': 'Square',
    'shape.triangle': 'Triangle',
    'shape.rectangle': 'Rectangle',
    'shape.oval': 'Oval',
    'shape.heart': 'Heart',
    'shape.star': 'Star',

    // Shape descriptions
    'shape.circle.desc': 'A round shape with no corners',
    'shape.square.desc': 'Four equal sides and four corners',
    'shape.triangle.desc': 'Three sides and three corners',
    'shape.rectangle.desc': 'Four sides, opposite sides equal',
    'shape.oval.desc': 'An elongated circle, like an egg',
    'shape.heart.desc': 'A symbol of love and friendship',
    'shape.star.desc': 'A shining star with five points',

    // Shape examples
    'shape.circle.ex1': 'Ball',
    'shape.circle.ex2': 'Sun',
    'shape.circle.ex3': 'Clock',
    'shape.circle.ex4': 'Wheel',
    'shape.square.ex1': 'Window',
    'shape.square.ex2': 'Book',
    'shape.square.ex3': 'Tile',
    'shape.square.ex4': 'Board',
    'shape.triangle.ex1': 'Roof',
    'shape.triangle.ex2': 'Pyramid',
    'shape.triangle.ex3': 'Sail',
    'shape.triangle.ex4': 'Mountain',
    'shape.rectangle.ex1': 'Door',
    'shape.rectangle.ex2': 'Phone',
    'shape.rectangle.ex3': 'Table',
    'shape.rectangle.ex4': 'Book',
    'shape.oval.ex1': 'Egg',
    'shape.oval.ex2': 'Balloon',
    'shape.oval.ex3': 'Mirror',
    'shape.oval.ex4': 'Leaf',
    'shape.heart.ex1': 'Valentine',
    'shape.heart.ex2': 'Candy',
    'shape.heart.ex3': 'Pillow',
    'shape.heart.ex4': 'Pendant',
    'shape.star.ex1': 'Starfish',
    'shape.star.ex2': 'Badge',
    'shape.star.ex3': 'Sticker',
    'shape.star.ex4': 'Decoration',

    // Shape UI
    'shape.corners': '{count} corners',
    'shape.difficulty.easy': 'Easy',
    'shape.difficulty.medium': 'Medium',
    'shape.difficulty.challenge': 'Challenge',
    'shape.thingsThatAre': 'Things that are {shape}:',
    'shape.whatShapeIsThis': 'What shape is this?',
    'shape.tryAgainCorrectIs': 'Try again! The correct shape is {shape}!',
    'shape.drawInAir': 'Draw a {shape} in the air! ✋',

    // Reward (shapes)
    'reward.shapeTastic': '🌟 Shape-tastic! 🌟',
    'reward.perfectShape': '🎉 Perfect Shape! 🎉',
    'reward.shapeMaster': '⭐ Shape Master! ⭐',
    'reward.wellRounded': '🎈 Well Rounded! 🎈',
    'reward.sharpSkills': '🏆 Sharp Skills! 🏆',
    'reward.completeAllShapes': '🎉 Complete! You mastered all shapes! 🎉',
    'reward.youAreShapeExpert': '🎉 You are a Shape Expert! 🎉',
    'reward.pointsForShape': '+{points} points for {shape}!',
    'reward.greatProgressShape': 'Great progress! You\'re becoming a shape expert!',
  },

  si: {
    // Common
    welcome: 'සාදරයෙන් පිළිගනිමු',
    getStarted: 'ආරම්භ කරන්න',
    iAlreadyHaveAccount: 'මට දැනටමත් ගිණුමක් ඇත',
    skip: 'අත්හරින්න',
    next: 'ඊළඟ',
    back: 'ආපසු',
    done: 'අවසන්',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    yes: 'ඔව්',
    no: 'නැත',
    ok: 'හරි',

    // Auth
    login: 'පිවිසෙන්න',
    signup: 'ලියාපදිංචි වන්න',
    signIn: 'පිවිසෙන්න',
    createAccount: 'ගිණුම සාදන්න',
    email: 'විද්‍යුත් තැපෑල',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    forgotPassword: 'මුරපදය අමතක වුණා ද?',
    continueAsGuest: 'අමුත්තකු ලෙස ඉදිරියට යන්න',
    dontHaveAccount: 'ගිණුමක් නැද්ද?',
    alreadyHaveAccountYes: 'දැනටමත් ගිණුමක් තිබේද?',
    register: 'ලියාපදිංචි වන්න',

    // Onboarding
    personalizedLearning: 'පුද්ගලීකරණය කළ ඉගෙනීම',
    personalizedLearningDesc: 'ඔබේ දරුවාගේ සුවිශේෂී හැකියාවන්ට සහ උනන්දුවන්ට ගැලපෙන අනුවර්තී පාඩම්',
    safeSocialPractice: 'ආරක්ෂිත සමාජ පුහුණුව',
    safeSocialPracticeDesc: 'සැබෑ ලෝක පීඩනයකින් තොරව අතථ්‍ය පරිසරවල සමාජ කුසලතා පුහුණු කරන්න',
    dailyRoutineSupport: 'දෛනික චර්යා සහාය',
    dailyRoutineSupportDesc: 'සුමට දෛනික සංක්‍රමණ සඳහා දෘශ්‍ය කාලසටහන් සහ මෘදු මතක් කිරීම්',
    funEducationalGames: 'විනෝදජනක අධ්‍යාපනික ක්‍රීඩා',
    funEducationalGamesDesc: 'විශ්වාසය සහ සංජානන කුසලතා ගොඩනඟන ආකර්ශනීය ක්‍රීඩා',

    // Dashboard
    dashboard: 'උපකරණ පුවරුව',
    hello: 'ආයුබෝවන්',
    readyToLearn: 'අද ඉගෙනීමට සහ වර්ධනය වීමට සූදානම්ද?',
    todaysProgress: 'අද දින ප්‍රගතිය',
    learning: 'ඉගෙනීම',
    games: 'ක්‍රීඩා',
    routine: 'දිනචර්යාව',
    socialSkills: 'සමාජ කුසලතා',
    quickActions: 'ක්ෂණික ක්‍රියා',
    continueLearning: 'ඉගෙනීම දිගටම කරගෙන යන්න',
    playGames: 'ක්‍රීඩා කරන්න',
    dailyRoutine: 'දෛනික දිනචර්යාව',
    todaysTasks: 'අද දින කාර්යයන්',
    morningRoutine: 'උදෑසන දිනචර්යාව',
    learningSession: 'ඉගෙනීමේ සැසිය',
    lunchTime: 'දිවා ආහාර වේලාව',
    gameTime: 'ක්‍රීඩා වේලාව',
    eveningRoutine: 'සවස දිනචර්යාව',
    recentAchievements: 'මෑත ජයග්‍රහණ',
    learnedNewWords: 'නව වචන 10 ක් ඉගෙන ගත්තා',
    completedGames: 'ක්‍රීඩා 5 ක් සම්පූර්ණ කළා',
    dayStreak: 'දින 7 ක අඛණ්ඩ පැවැත්ම',
    parentTip: 'අද දින දෙමාපිය ඉඟිය',
    parentTipText: '“කුඩා ජයග්‍රහණ සැමරීමට මතක තබා ගන්න! එක් එක් පියවර ඉදිරියට, කුඩා වුවත්, පිළිගැනීම වටිනා ප්‍රගතියකි.”',

    // Learning Screen
    learningJourney: 'ඉගෙනුම් ගමන',
    exploreLessons: 'ඔබේම වේගයෙන් පාඩම් ගවේෂණය කරන්න',
    continueLearningPickup: 'ඉගෙනීම දිගටම කරගෙන යන්න',
    pickUpWhereLeft: 'නතර කළ තැනින් නැවත ආරම්භ කරන්න',
    letterAApple: 'අකුර අ - ඇපල්',
    learningWordsWithA: 'අ අකුරින් ආරම්භ වන වචන ඉගෙනීම',
    learningCategories: 'ඉගෙනුම් ප්‍රවර්ග',
    lettersNumbers: 'අකුරු සහ ඉලක්කම්',
    colorsShapes: 'වර්ණ සහ හැඩතල',
    dailyActivities: 'දෛනික ක්‍රියාකාරකම්',
    animalsNature: 'සතුන් සහ ස්වභාවය',
    emotions: 'හැඟීම්',
    socialStories: 'සමාජ කථා',
    recommendedForYou: 'ඔබ වෙනුවෙන් නිර්දේශිත',
    interactiveStory: 'අන්තර්ක්‍රියාකාරී කථාව: හිතවත් මකරා',
    countingWithColors: 'වර්ණ සමඟ ගණන් කිරීම',
    emotionMatchingGame: 'හැඟීම් ගැලපීමේ ක්‍රීඩාව',
    arLearning: 'වැඩිදියුණු කළ යථාර්ථ ඉගෙනීම',
    bringLessonsToLife: 'වැඩිදියුණු කළ යථාර්ථය සමඟ පාඩම් ජීවමාන කරන්න',
    startArExperience: 'AR අත්දැකීම ආරම්භ කරන්න',
    lessons: 'පාඩම්',
    completed: 'සම්පූර්ණයි',

    // Games Screen
    funGames: 'විනෝදජනක ක්‍රීඩා',
    playLearnGrow: 'ක්‍රීඩා කරන්න, ඉගෙන ගන්න, වර්ධනය වන්න!',
    dailyChallenge: 'දෛනික අභියෝගය',
    completeForRewards: 'ප්‍රසාද ත්‍යාග සඳහා සම්පූර්ණ කරන්න',
    completeMemoryGames: 'මතක ක්‍රීඩා 3 ක් සම්පූර්ණ කරන්න',
    rewardStars: 'ත්‍යාගය: තරු 50',
    progress: 'ප්‍රගතිය',
    playNow: 'දැන් ක්‍රීඩා කරන්න',
    allGames: 'සියලුම ක්‍රීඩා',
    memoryMatch: 'මතක ගැලපීම',
    matchPairs: 'කාඩ් යුගල ගලපන්න',
    colorSorting: 'වර්ණ වර්ගීකරණය',
    sortObjectsByColor: 'වස්තු වර්ණය අනුව වර්ග කරන්න',
    shapePuzzle: 'හැඩතල ප්‍රහේලිකාව',
    completeShapePuzzles: 'හැඩතල ප්‍රහේලිකා සම්පූර්ණ කරන්න',
    emotionMatch: 'හැඟීම් ගැලපීම',
    matchFacesWithEmotions: 'හැඟීම් සමඟ මුහුණු ගලපන්න',
    patternMaker: 'රටා සාදන්නා',
    createPatterns: 'රටා සාදන්න',
    numberHunt: 'අංක දඩයම',
    findHiddenNumbers: 'සැඟවුණු අංක සොයන්න',
    recentlyPlayed: 'මෑතකදී ක්‍රීඩා කළ',
    playedAgo: 'පැය 2 කට පෙර ක්‍රීඩා කළා',
    filterByCategory: 'ප්‍රවර්ගය අනුව පෙරන්න:',
    all: 'සියල්ල',
    memory: 'මතකය',
    puzzle: 'ප්‍රහේලිකාව',
    educational: 'අධ්‍යාපනික',
    fun: 'විනෝදය',
    socialCat: 'සමාජීය',
    difficulty: 'දුෂ්කරතාව',
    stars: 'තරු',
    easy: 'පහසු',
    medium: 'මධ්‍යම',
    hard: 'දුෂ්කර',

    // Game Messages
    gameUnderDevelopment: 'මෙම ක්‍රීඩාව සංවර්ධනය වෙමින් පවතී. රැඳී සිටින්න!',
    comingSoon: 'ඉක්මනින් එනවා!',
    question: 'ප්‍රශ්නය',
    score: 'ලකුණු',
    levelComplete: 'මට්ටම සම්පූර්ණයි!',
    gameComplete: 'ක්‍රීඩාව සම්පූර්ණයි!',
    congratulations: 'සුභ පැතුම්!',
    tryAgain: 'නැවත උත්සාහ කරන්න!',
    correct: 'නිවැරදියි!',
    incorrect: 'වැරදියි!',

    // More additions for games
    oddOneOut: 'වෙනස් එක සොයන්න',
    whatComesNext: 'ඊළඟට එන්නේ කුමක්ද?',
    sortingGame: 'වර්ගීකරණ ක්‍රීඩාව',
    wordAnalogies: 'වචන සාදෘශ්‍ය',
    traceLetter: 'අකුරු සොයාගැනීම',
    traceNumber: 'අංක සොයාගැනීම',
    arExperience: 'AR අත්දැකීම',

    // Rewards and Feedback
    greatJob: 'නියමයි!',
    excellentWork: 'විශිෂ්ට කාර්යයක්!',
    keepPracticing: 'දිගටම පුහුණු වන්න!',
    youCanDoIt: 'ඔබට එය කළ හැකියි!',
    almostThere: 'බොහෝ දුරට එහි!',
    perfectScoreMessage: 'පරිපූර්ණ ලකුණු! ඔබ මෙය ප්‍රගුණ කළා!',

    // Routine Screen
    dailyRoutineTitle: 'දෛනික දිනචර්යාව',
    todaysSchedule: 'අද දින කාලසටහන',
    currentActivity: 'වත්මන් ක්‍රියාකාරකම',
    completeDailyLessons: 'ඔබේ දෛනික පාඩම් සම්පූර්ණ කරන්න',
    start: 'ආරම්භ කරන්න',
    dailyProgress: 'දෛනික ප්‍රගතිය',
    tasksCompleted: 'කාර්යයන් සම්පූර්ණ විය',
    wakeUp: 'අවදි වන්න',
    brushTeeth: 'දත් මදින්න',
    breakfast: 'උදෑසන ආහාරය',
    learningTime: 'ඉගෙනුම් වේලාව',
    playTime: 'ක්‍රීඩා වේලාව',
    lunch: 'දිවා ආහාරය',
    quietTime: 'සන්සුන් වේලාව',
    outdoorPlay: 'එළිමහන් ක්‍රීඩා',
    dinner: 'රාත්‍රී ආහාරය',
    bedtime: 'නිදාගැනීමේ වේලාව',
    upcoming: 'ඉදිරියේදී',
    addCustomActivity: 'අභිරුචි ක්‍රියාකාරකමක් එක් කරන්න',
    routineTips: 'දිනචර්යා ඉඟි',
    visualTimers: 'සංක්‍රමණ සඳහා උපකාර කිරීමට දෘශ්‍ය ටයිමර් භාවිතා කරන්න',
    minuteWarnings: 'ක්‍රියාකාරකම් වෙනස්වීමට පෙර විනාඩි 5 අනතුරු ඇඟවීම් දෙන්න',
    celebrateCompleting: 'සෑම කාර්යයක්ම ප්‍රශංසාවෙන් සමරන්න',
    keepRoutinesConsistent: 'දිනචර්යාවන් ස්ථාවර නමුත් නම්‍යශීලීව තබා ගන්න',

    // Behavioral Screen
    socialSkillsTraining: 'සමාජ කුසලතා පුහුණුව',
    practiceVirtualEnvironments: 'ආරක්ෂිත අතථ්‍ය පරිසරවල පුහුණු වන්න',
    virtualRealityPractice: 'අතථ්‍ය යථාර්ථ පුහුණුව',
    safeEnvironmentPractice: 'සමාජ පුහුණුව සඳහා ආරක්ෂිත පරිසරය',
    currentScenario: 'වත්මන් අවස්ථාව: උද්‍යානයේ ක්‍රීඩා කිරීම',
    practiceGreetingFriends: 'මිතුරන්ට ආචාර කිරීම සහ සෙල්ලම් බඩු බෙදාගැනීම පුහුණු කරන්න',
    startVrSession: 'VR සැසිය ආරම්භ කරන්න',
    emotionRecognition: 'හැඟීම් හඳුනාගැනීම',
    identifyDifferentEmotions: 'විවිධ හැඟීම් හඳුනා ගැනීමට ඉගෙන ගන්න',
    tapToSelect: 'හැඟීම තෝරාගැනීමට තට්ටු කරන්න:',
    happy: 'සතුටුයි',
    sad: 'දුකයි',
    angry: 'තරහයි',
    scared: 'බයයි',
    excited: 'උද්යෝගිමත්',
    calm: 'සන්සුන්',
    greatYouSelected: 'නියමයි! ඔබ තෝරාගත්තේ',
    socialScenarios: 'සමාජ අවස්ථා',
    greetingFriends: 'මිතුරන්ට ආචාර කිරීම',
    learnHelloGoodbye: 'ආයුබෝවන් සහ බායි කියන්න ඉගෙන ගන්න',
    sharingToys: 'සෙල්ලම් බඩු බෙදාගැනීම',
    practiceTakingTurns: 'වාර ගැනීම පුහුණු කරන්න',
    understandingEmotions: 'හැඟීම් අවබෝධ කර ගැනීම',
    recognizeDifferentFeelings: 'විවිධ හැඟීම් හඳුනා ගන්න',
    playingTogether: 'එකට ක්‍රීඩා කිරීම',
    groupPlayActivities: 'කණ්ඩායම් ක්‍රීඩා ක්‍රියාකාරකම්',
    dealingWithAnger: 'තරහට මුහුණ දීම',
    calmDownStrategies: 'සන්සුන් වීමේ උපාය මාර්ග',
    publicPlaces: 'පොදු ස්ථාන',
    behaviorStoresParks: 'ගබඩා සහ උද්‍යානවල හැසිරීම',
    progressTracking: 'ප්‍රගති නිරීක්ෂණය',
    communication: 'සන්නිවේදනය',
    socialSkillsTips: 'සමාජ කුසලතා ඉඟි',
    useSimpleLanguage: 'සරල, පැහැදිලි භාෂාව භාවිතා කරන්න',
    practiceVisualAids: 'දෘශ්‍ය ආධාරක සමඟ පුහුණු වන්න',
    roleplayScenarios: 'විවිධ අවස්ථා රඟපෑම',
    positiveReinforcement: 'ධනාත්මක ශක්තිකරණයක් සපයන්න',
    patientConsistent: 'ඉවසිලිවන්ත හා ස්ථාවර වන්න',

    // Settings
    settings: 'සැකසුම්',
    notifications: 'දැනුම්දීම්',
    theme: 'තේමාව',
    language: 'භාෂාව',
    darkMode: 'අඳුරු මාදිලිය',
    lightMode: 'ආලෝක මාදිලිය',
    english: 'ඉංග්‍රීසි',
    sinhala: 'සිංහල',
    tamil: 'දෙමළ',
    profile: 'පැතිකඩ',
    logout: 'පිටවන්න',
    editProfile: 'පැතිකඩ සංස්කරණය කරන්න',
    childName: 'දරුවාගේ නම',
    childAge: 'දරුවාගේ වයස',
    parentName: 'දෙමාපියාගේ නම',
    phone: 'දුරකථන අංකය',
    notificationsDesc: 'දරුවාගේ ප්‍රගතිය පිළිබඳ යාවත්කාලීන ලබා ගන්න',
    pushNotifications: 'පුෂ් දැනුම්දීම්',
    emailNotifications: 'විද්‍යුත් තැපෑල දැනුම්දීම්',
    soundAlerts: 'ශබ්ද අනතුරු ඇඟවීම්',
    vibration: 'කම්පනය',
    systemDefault: 'පද්ධති පෙරනිමිය',
    selectLanguage: 'භාෂාව තෝරන්න',
    selectTheme: 'තේමාව තෝරන්න',
    about: 'පිළිබඳව',
    privacyPolicy: 'රහස්‍යතා ප්‍රතිපත්තිය',
    termsOfService: 'සේවා කොන්දේසි',
    help: 'උදව්',
    contactSupport: 'සහාය අමතන්න',
    version: 'අනුවාදය',
    areYouSureLogout: 'ඔබට නික්මීමට විශ්වාසද?',
    profileUpdated: 'පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!',

    // Profile
    changePhoto: 'ඡායාරූපය වෙනස් කරන්න',
    childInformation: 'ළමා තොරතුරු',
    age: 'වයස',
    gender: 'ස්ත්‍රී පුරුෂ භාවය',
    years: 'වසර',
    appSettings: 'යෙදුම් සැකසුම්',
    manageSettings: 'දැනුම්දීම්, භාෂාව, තේමාව සහ තවත් දේ කළමනාකරණය කරන්න',

    // ─── ADDITIONAL KEYS FOR LEARNING SCREENS ───
    alreadyHaveAccount: 'දැනටමත් ගිණුමක් තිබේද?',
    colors: 'වර්ණ',
    'progress.of': '{current} / {total} {item}',

    // Color instruction & names
    'color.instruction': 'පහත දැක්වෙන වර්ණය තෝරන්න',
    'color.red': 'රතු',
    'color.blue': 'නිල්',
    'color.green': 'කොළ',
    'color.yellow': 'කහ',
    'color.orange': 'තැඹිලි',
    'color.purple': 'දම්',
    'color.pink': 'රෝස',
    'color.brown': 'දුඹුරු',
    'color.black': 'කළු',
    'color.white': 'සුදු',

    // Objects
    'object.apple': 'ඇපල්',
    'object.rose': 'රෝස මල',
    'object.ball': 'බෝලය',
    'object.sky': 'අහස',
    'object.ocean': 'සාගරය',
    'object.blueberry': 'බ්ලූබෙරි',
    'object.grass': 'තණකොළ',
    'object.tree': 'ගස',
    'object.leaf': 'කොළය',
    'object.sun': 'හිරු',
    'object.banana': 'කෙසෙල්',
    'object.star': 'තරුව',
    'object.orangeFruit': 'දොඩම් ගෙඩිය',
    'object.pumpkin': 'වට්ටක්කා',
    'object.carrot': 'කැරට්',
    'object.grapes': 'මිදි',
    'object.eggplant': 'වම්බටු',
    'object.lavender': 'ලැවෙන්ඩර්',
    'object.flower': 'මල',
    'object.cottonCandy': 'කපු කැන්ඩි',
    'object.pig': 'ඌරා',
    'object.chocolate': 'චොකලට්',
    'object.treeTrunk': 'ගස් කඳ',
    'object.bear': 'වලසා',
    'object.nightSky': 'රාත්‍රී අහස',
    'object.penguin': 'පෙන්ගුවින්',
    'object.tire': 'ටයරය',
    'object.cloud': 'වලාකුළ',
    'object.snow': 'හිම',
    'object.milk': 'කිරි',

    // Color UI
    'color.thingsThatAre': '{color} වර්ණයෙන් යුත් දේවල්',
    'color.whatColorIsThis': 'මෙය කුමන වර්ණයද?',
    'color.tryAgainCorrectIs': 'නැවත උත්සාහ කරන්න! නිවැරදි වර්ණය {color} වේ!',

    // Reward messages (colors)
    'reward.amazing': '🌟 පුදුමයි! 🌟',
    'reward.greatJob': '🎉 නියමයි! 🎉',
    'reward.youreAStar': '⭐ ඔබ තරුවක්! ⭐',
    'reward.fantastic': '🎈 අපූරුයි! 🎈',
    'reward.excellent': '🏆 විශිෂ්ටයි! 🏆',
    'reward.keepGoing': '💪 දිගටම යන්න! 💪',
    'reward.beautiful': '🌈 ලස්සනයි! 🌈',
    'reward.completeAllColors': '🎉 සම්පූර්ණයි! ඔබ සියලු වර්ණ ප්‍රගුණ කළා! 🎉',
    'reward.youAreColorMaster': '🎉 ඔබ වර්ණ ප්‍රවීණයෙක්! 🎉',
    'reward.pointsForColor': '{color} සඳහා +{points} ලකුණු!',
    'reward.greatProgress': 'නියම ප්‍රගතියක්! දිගටම යන්න!',

    // Common UI
    'common.backToMenu': 'මෙනුවට ආපසු',
    'common.continue': 'දිගටම',

    // Animal instruction & names
    'animal.instruction': 'පහත දැක්වෙන සත්වයා තෝරන්න',
    'animal.lion': 'සිංහයා',
    'animal.elephant': 'අලියා',
    'animal.monkey': 'වඳුරා',
    'animal.giraffe': 'ජිරාෆ්',
    'animal.panda': 'පැන්ඩා',
    'animal.dolphin': 'ඩොල්ෆින්',

    // Shape instruction & names
    'shape.instruction': 'පහත දැක්වෙන හැඩය තෝරන්න',
    'shape.circle': 'රවුම',
    'shape.square': 'චතුරස්‍රය',
    'shape.triangle': 'ත්‍රිකෝණය',
    'shape.rectangle': 'සෘජුකෝණාස්‍රය',
    'shape.oval': 'ඕවලාකාර',
    'shape.heart': 'හදවත',
    'shape.star': 'තරුව',

    // Shape descriptions
    'shape.circle.desc': 'කොන් නැති වටකුරු හැඩය',
    'shape.square.desc': 'සමාන පැති හතරක් සහ කොන් හතරක්',
    'shape.triangle.desc': 'පැති තුනක් සහ කොන් තුනක්',
    'shape.rectangle.desc': 'පැති හතරක්, ප්‍රතිවිරුද්ධ පැති සමාන වේ',
    'shape.oval.desc': 'දිගටි රවුම, බිත්තරයක් වගේ',
    'shape.heart.desc': 'ආදරයේ සහ මිත්‍රත්වයේ සංකේතය',
    'shape.star.desc': 'පැති පහක් සහිත බබළන තරුව',

    // Shape examples
    'shape.circle.ex1': 'බෝලය',
    'shape.circle.ex2': 'හිරු',
    'shape.circle.ex3': 'ඔරලෝසුව',
    'shape.circle.ex4': 'රෝදය',
    'shape.square.ex1': 'ජනේලය',
    'shape.square.ex2': 'පොත',
    'shape.square.ex3': 'ටයිල්',
    'shape.square.ex4': 'පුවරුව',
    'shape.triangle.ex1': 'වහලය',
    'shape.triangle.ex2': 'පිරමීඩය',
    'shape.triangle.ex3': 'රුවල්',
    'shape.triangle.ex4': 'කන්ද',
    'shape.rectangle.ex1': 'දොර',
    'shape.rectangle.ex2': 'දුරකථනය',
    'shape.rectangle.ex3': 'මේසය',
    'shape.rectangle.ex4': 'පොත',
    'shape.oval.ex1': 'බිත්තරය',
    'shape.oval.ex2': 'බැලූනය',
    'shape.oval.ex3': 'කණ්ණාඩිය',
    'shape.oval.ex4': 'කොළය',
    'shape.heart.ex1': 'වැලන්ටයින්',
    'shape.heart.ex2': 'කැන්ඩි',
    'shape.heart.ex3': 'කොට්ටය',
    'shape.heart.ex4': 'පෙන්ඩන්ට්',
    'shape.star.ex1': 'මුහුදු තරුව',
    'shape.star.ex2': 'බැජ්',
    'shape.star.ex3': 'ස්ටිකරය',
    'shape.star.ex4': 'සැරසිලි',

    // Shape UI
    'shape.corners': 'කොන් {count}',
    'shape.difficulty.easy': 'පහසු',
    'shape.difficulty.medium': 'මධ්‍යම',
    'shape.difficulty.challenge': 'අභියෝගය',
    'shape.thingsThatAre': '{shape} හැඩයෙන් යුත් දේවල්',
    'shape.whatShapeIsThis': 'මෙය කුමන හැඩයද?',
    'shape.tryAgainCorrectIs': 'නැවත උත්සාහ කරන්න! නිවැරදි හැඩය {shape} වේ!',
    'shape.drawInAir': 'අහසේ {shape} හැඩයක් අඳින්න! ✋',

    // Reward (shapes)
    'reward.shapeTastic': '🌟 හැඩයක් නියමයි! 🌟',
    'reward.perfectShape': '🎉 පරිපූර්ණ හැඩය! 🎉',
    'reward.shapeMaster': '⭐ හැඩයේ ප්‍රවීණයා! ⭐',
    'reward.wellRounded': '🎈 වටකුරු කුසලතා! 🎈',
    'reward.sharpSkills': '🏆 තියුණු කුසලතා! 🏆',
    'reward.completeAllShapes': '🎉 සම්පූර්ණයි! ඔබ සියලු හැඩතල ප්‍රගුණ කළා! 🎉',
    'reward.youAreShapeExpert': '🎉 ඔබ හැඩතල විශේෂඥයෙක්! 🎉',
    'reward.pointsForShape': '{shape} ඉගෙනීම සඳහා +{points} ලකුණු!',
    'reward.greatProgressShape': 'නියම ප්‍රගතියක්! ඔබ හැඩතල ප්‍රවීණයෙක් වෙමින්!',
  },
  ta: {
    // Tamil translations (partial, but enough to avoid fallback issues for common keys)
    welcome: 'வரவேற்கிறோம்',
    getStarted: 'தொடங்குங்கள்',
    skip: 'தவிர்க்கவும்',
    next: 'அடுத்தது',
    back: 'பின்செல்',
    done: 'முடிந்தது',
    save: 'சேமிக்கவும்',
    cancel: 'ரத்து செய்யவும்',
    yes: 'ஆம்',
    no: 'இல்லை',
    ok: 'சரி',
    login: 'உள்நுழைய',
    signup: 'பதிவு செய்யவும்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    continueAsGuest: 'விருந்தினராகத் தொடரவும்',
    // Add more as needed – but English fallback will cover missing ones
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang === 'en' || savedLang === 'si' || savedLang === 'ta') {
        setLanguageState(savedLang);
      } else {
        const locales = Localization.getLocales();
        if (locales.length > 0) {
          const deviceLang = locales[0].languageCode;
          if (deviceLang === 'si' || deviceLang === 'ta') {
            setLanguageState(deviceLang);
            await AsyncStorage.setItem('app_language', deviceLang);
          }
        }
      }
    } catch (error) {
      console.log('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: LanguageType) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const langTranslations = translations[language];
    let translation = (langTranslations as any)[key];
    if (!translation && language !== 'en') {
      translation = (translations.en as any)[key];
    }
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(paramKey => {
        const paramValue = params[paramKey];
        if (paramValue !== undefined && paramValue !== null) {
          translation = translation.replace(`{${paramKey}}`, String(paramValue));
        }
      });
    }
    return translation;
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' },
  ];
};