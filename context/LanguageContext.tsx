// context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type LanguageType = 'en' | 'si' | 'ta';

interface LanguageContextType {
  language: LanguageType;
  t: (key: string, params?: Record<string, any>) => string;
  setLanguage: (lang: LanguageType) => void;
}

// Complete translations for all screens
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
  },
  si: {
    // Sinhala translations
    welcome: 'සාදරයෙන් පිළිගනිමු',
    getStarted: 'ආරම්භ කරන්න',
    iAlreadyHaveAccount: 'මට දැනටමත් ගිණුමක් ඇත',
    skip: 'ඒළඟට',
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
    personalizedLearning: 'වෙනම් කරන ලද ඉගෙනීම',
    personalizedLearningDesc: 'ඔබේ දරුවාගේ අද්විතීය හැකියාවන්ට සහ උනන්දුවන්ට ගැළපෙන අනුවර්තී පාඩම්',
    safeSocialPractice: 'සුරක්ෂිත සමාජ අභ්‍යාස',
    safeSocialPracticeDesc: 'සැබෑ ලෝක පීඩනයකින් තොරව අතථ්‍ය පරිසරවල සමාජ කුසලතා අභ්‍යාස කරන්න',
    dailyRoutineSupport: 'දෛනික චර්යා සහාය',
    dailyRoutineSupportDesc: 'සුමට දෛනික සංක්‍රමණ සඳහා දෘශ්‍ය කාලසටහන් සහ මෘදු මතක් කිරීම්',
    funEducationalGames: 'විනෝදජනක අධ්‍යාපන ක්‍රීඩා',
    funEducationalGamesDesc: 'ආත්ම විශ්වාසය සහ ප්‍රජානන කුසලතා ගොඩනඟන ග්‍රහණය කරගත හැකි ක්‍රීඩා',
    
    // Dashboard
    dashboard: 'ප්‍රධාන පුවරුව',
    hello: 'හෙලෝ',
    readyToLearn: 'අද ඉගෙනීමට සහ වර්ධනය වීමට සූදානම්ද?',
    todaysProgress: 'අදගේ ප්‍රගතිය',
    learning: 'ඉගෙනීම',
    games: 'ක්‍රීඩා',
    routine: 'දින චර්යාව',
    socialSkills: 'සමාජ කුසලතා',
    quickActions: 'ක්ෂණික ක්‍රියා',
    continueLearning: 'ඉගෙනීම දිගටම කරගෙන යන්න',
    playGames: 'ක්‍රීඩා කරන්න',
    dailyRoutine: 'දෛනික චර්යාව',
    todaysTasks: 'අදගේ කාර්යයන්',
    morningRoutine: 'උදේ දින චර්යාව',
    learningSession: 'ඉගෙනීමේ සැසිය',
    lunchTime: 'මධ්‍යාහ්න කෑම',
    gameTime: 'ක්‍රීඩා වේලාව',
    eveningRoutine: 'සවස් වේලා දින චර්යාව',
    recentAchievements: 'මෑතක දිනුම්',
    learnedNewWords: 'නව වචන 10 ක් ඉගෙන ගත්තා',
    completedGames: 'ක්‍රීඩා 5 ක් සම්පූර්ණ කළා',
    dayStreak: 'දින 7 අඛණ්ඩව',
    parentTip: 'අද සඳහා දෙමව්පියන්ගේ ඉඟිය',
    parentTipText: '"කුඩා ජයග්‍රහණ සමරන්න මතක තබා ගන්න! කුඩා වුවද එක් එක් ඉදිරි පියවර සැලකිල්ලට ගත යුතු ප්‍රගතියකි."',
    
    // Learning Screen
    learningJourney: 'ඉගෙනීමේ ගමන',
    exploreLessons: 'ඔබේම වේගයෙන් පාඩම් ගවේෂණය කරන්න',
    continueLearningPickup: 'ඉගෙනීම දිගටම කරගෙන යන්න',
    pickUpWhereLeft: 'ඔබ නතර කළ තැනින් අරඹන්න',
    letterAApple: 'අකුර අ - ඇපල්',
    learningWordsWithA: 'අකුර අ වලින් ආරම්භ වන වචන ඉගෙනීම',
    learningCategories: 'ඉගෙනීමේ කාණ්ඩ',
    lettersNumbers: 'අකුරු සහ අංක',
    colorsShapes: 'වර්ණ සහ හැඩතල',
    dailyActivities: 'දෛනික ක්‍රියාකාරකම්',
    animalsNature: 'සත්වයින් සහ ප්‍රකෘතිය',
    emotions: 'හැඟීම්',
    socialStories: 'සමාජ කතා',
    recommendedForYou: 'ඔබ වෙනුවෙන් නිර්දේශිත',
    interactiveStory: 'අන්තර්ක්‍රියාකාරී කතාව: හිතවත් මකරා',
    countingWithColors: 'වර්ණ සමග ගණන් කිරීම',
    emotionMatchingGame: 'හැඟීම් ගැලපෙන ක්‍රීඩාව',
    arLearning: 'AR ඉගෙනීම',
    bringLessonsToLife: 'වර්ධිත යථාර්ථය සමග පාඩම් ජීවමාන කරන්න',
    startArExperience: 'AR අත්දැකීම අරඹන්න',
    lessons: 'පාඩම්',
    completed: 'සම්පූර්ණ',
    
    // Games Screen
    funGames: 'විනෝදජනක ක්‍රීඩා',
    playLearnGrow: 'ක්‍රීඩා කරන්න, ඉගෙන ගන්න සහ වර්ධනය වන්න!',
    dailyChallenge: 'දෛනික අභියෝගය',
    completeForRewards: 'අතිරේක ප්‍රසාද සඳහා සම්පූර්ණ කරන්න',
    completeMemoryGames: 'මතක ක්‍රීඩා 3 ක් සම්පූර්ණ කරන්න',
    rewardStars: 'ප්‍රසාදය: තරු 50',
    progress: 'ප්‍රගතිය',
    playNow: 'දැන් ක්‍රීඩා කරන්න',
    allGames: 'සියලුම ක්‍රීඩා',
    memoryMatch: 'මතක ගැළපීම',
    matchPairs: 'පත්‍ර යුගල ගැලපෙන්න',
    colorSorting: 'වර්ණ වර්ගීකරණය',
    sortObjectsByColor: 'වස්තු වර්ණය අනුව වර්ග කරන්න',
    shapePuzzle: 'හැඩතල ප්‍රහේලිකා',
    completeShapePuzzles: 'හැඩතල ප්‍රහේලිකා සම්පූර්ණ කරන්න',
    emotionMatch: 'හැඟීම් ගැලපීම',
    matchFacesWithEmotions: 'හැඟීම් සමග මුහුණු ගැලපෙන්න',
    patternMaker: 'රටා සාදනය',
    createPatterns: 'රටා සාදන්න',
    numberHunt: 'අංක හීන්මැරීම',
    findHiddenNumbers: 'සැඟවුණු අංක සොයන්න',
    recentlyPlayed: 'මෑතකදී ක්‍රීඩා කළ',
    playedAgo: 'පැය 2 කට පෙර ක්‍රීඩා කළා',
    filterByCategory: 'කාණ්ඩය අනුව පෙරහන් කරන්න:',
    all: 'සියල්ල',
    memory: 'මතකය',
    puzzle: 'ප්‍රහේලිකා',
    educational: 'අධ්‍යාපනික',
    fun: 'විනෝදය',
    socialCat: 'සමාජ',
    difficulty: 'දුෂ්කරතාවය',
    stars: 'තරු',
    easy: 'පහසු',
    medium: 'මධ්‍යස්ථ',
    hard: 'කඩිසර',
    
    // Routine Screen
    dailyRoutineTitle: 'දෛනික චර්යාව',
    todaysSchedule: 'අදගේ කාලසටහන',
    currentActivity: 'වත්මන් ක්‍රියාකාරකම',
    completeDailyLessons: 'ඔබේ දෛනික පාඩම් සම්පූර්ණ කරන්න',
    start: 'අරඹන්න',
    dailyProgress: 'දෛනික ප්‍රගතිය',
    tasksCompleted: 'කාර්යයන් සම්පූර්ණ විය',
    wakeUp: 'අවදි වන්න',
    brushTeeth: 'දත් මැදීම',
    breakfast: 'උදේ කෑම',
    learningTime: 'ඉගෙනීමේ වේලාව',
    playTime: 'ක්‍රීඩා වේලාව',
    lunch: 'මධ්‍යාහ්න කෑම',
    quietTime: 'සන්සුන් වේලාව',
    outdoorPlay: 'පිටත ක්‍රීඩා',
    dinner: 'රාත්‍රී කෑම',
    bedtime: 'නිදා ගැනීමේ වේලාව',
    upcoming: 'ඉදිරියේදී',
    addCustomActivity: 'අභිමත ක්‍රියාකාරකමක් එකතු කරන්න',
    routineTips: 'චර්යා ඉඟි',
    visualTimers: 'සංක්‍රමණ සඳහා උදව් කිරීමට දෘශ්‍ය කාලයන් භාවිතා කරන්න',
    minuteWarnings: 'ක්‍රියාකාරකම් වෙනස්වීමට පෙර මිනිත්තු 5 අනතුරු ඇඟවීම් දෙන්න',
    celebrateCompleting: 'සෑම කාර්යයක් සම්පූර්ණ කිරීම ප්‍රශංසාවෙන් සමරන්න',
    keepRoutinesConsistent: 'චර්යාවන් ස්ථාවර නමුත් නම්‍යශීලීව තබා ගන්න',
    
    // Behavioral Screen
    socialSkillsTraining: 'සමාජ කුසලතා පුහුණුව',
    practiceVirtualEnvironments: 'සුරක්ෂිත අතථ්‍ය පරිසරවල අභ්‍යාස කරන්න',
    virtualRealityPractice: 'අතථ්‍ය යථාර්ථ පුහුණුව',
    safeEnvironmentPractice: 'සමාජ අභ්‍යාස සඳහා සුරක්ෂිත පරිසරය',
    currentScenario: 'වත්මන් තත්වය: උද්‍යානයේ ක්‍රීඩා කිරීම',
    practiceGreetingFriends: 'මිතුරන් සමුගැනීම සහ ක්‍රීඩා බෙදාගැනීම අභ්‍යාස කරන්න',
    startVrSession: 'VR සැසිය අරඹන්න',
    emotionRecognition: 'හැඟීම් හඳුනාගැනීම',
    identifyDifferentEmotions: 'විවිධ හැඟීම් හඳුනා ගන්න ඉගෙන ගන්න',
    tapToSelect: 'හැඟීම තෝරා ගැනීමට තට්ටු කරන්න:',
    happy: 'සතුටු',
    sad: 'දුක්ඛිත',
    angry: 'රිසියෙන්',
    scared: 'බය',
    excited: 'උද්දීපනය',
    calm: 'සන්සුන්',
    greatYouSelected: 'හොඳයි! ඔබ තෝරාගත්තේ',
    socialScenarios: 'සමාජ තත්වයන්',
    greetingFriends: 'මිතුරන් සමුගැනීම',
    learnHelloGoodbye: 'හෙලෝ සහ බායි සැමවිටම කියන්න ඉගෙන ගන්න',
    sharingToys: 'ක්‍රීඩා බෙදාගැනීම',
    practiceTakingTurns: 'වාර කිරීම අභ්‍යාස කරන්න',
    understandingEmotions: 'හැඟීම් අවබෝධ කර ගැනීම',
    recognizeDifferentFeelings: 'විවිධ හැඟීම් හඳුනාගන්න',
    playingTogether: 'එකට ක්‍රීඩා කිරීම',
    groupPlayActivities: 'කණ්ඩායම් ක්‍රීඩා ක්‍රියාකාරකම්',
    dealingWithAnger: 'කෝපයට මුහුණ දීම',
    calmDownStrategies: 'සන්සුන වීමේ උපායමාර්ග',
    publicPlaces: 'පොදු ස්ථාන',
    behaviorStoresParks: 'ගබඩා සහ උද්‍යානවල හැසිරීම',
    progressTracking: 'ප්‍රගතිය අධීක්ෂණය',
    communication: 'සන්නිවේදනය',
    socialSkillsTips: 'සමාජ කුසලතා ඉඟි',
    useSimpleLanguage: 'සරල, පැහැදිලි භාෂාව භාවිතා කරන්න',
    practiceVisualAids: 'දෘශ්‍ය උපකරණ සමග අභ්‍යාස කරන්න',
    roleplayScenarios: 'විවිධ තත්වයන් රඟපෑම',
    positiveReinforcement: 'ධනාත්මක ශක්තිකරණය සපයන්න',
    patientConsistent: 'ඉවසිලිවන්ත හා ස්ථාවර වන්න',
    
    // Settings
    settings: 'සැකසුම්',
    notifications: 'දැනුම්දීම්',
    theme: 'තේමාව',
    language: 'භාෂාව',
    darkMode: 'තද පැහැති ප්‍රකාරය',
    lightMode: 'සැහැල්ලු පැහැති ප්‍රකාරය',
    english: 'ඉංග්‍රීසි',
    sinhala: 'සිංහල',
    tamil: 'දෙමළ',
    profile: 'පැතිකඩ',
    logout: 'නික්මෙන්න',
    editProfile: 'පැතිකඩ සංස්කරණය',
    childName: 'ළමයාගේ නම',
    childAge: 'ළමයාගේ වයස',
    parentName: 'මව්පියගේ නම',
    phone: 'දුරකථන අංකය',
    notificationsDesc: 'ළමයාගේ ප්‍රගතිය පිළිබඳ යාවත්කාලීන ලබාගන්න',
    pushNotifications: 'පුෂ් දැනුම්දීම්',
    emailNotifications: 'විද්‍යුත් තැපෑල දැනුම්දීම්',
    soundAlerts: 'ශබ්ද ඇඟවීම්',
    vibration: 'ස්පන්දනය',
    systemDefault: 'පද්ධතියේ පෙරනිමිය',
    selectLanguage: 'භාෂාව තෝරන්න',
    selectTheme: 'තේමාව තෝරන්න',
    about: 'පිළිබඳව',
    privacyPolicy: 'රහස්‍යතා ප්‍රතිපත්තිය',
    termsOfService: 'සේවා නියමයන්',
    help: 'උදව්',
    contactSupport: 'සහාය අමතන්න',
    version: 'ප්‍රකාශනය',
    areYouSureLogout: 'ඔබට ඇත්තටම නික්ම යාමට අවශ්‍යද?',
    profileUpdated: 'පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදි!',
    
    // Profile
    changePhoto: 'ඡායාරූපය වෙනස් කරන්න',
    childInformation: 'ළමයාගේ තොරතුරු',
    age: 'වයස',
    gender: 'ස්ත්‍රී පුරුෂ භාවය',
    years: 'වර්ෂ',
    appSettings: 'යෙදුම් සැකසුම්',
    manageSettings: 'දැනුම්දීම්, භාෂාව, තේමාව සහ වැඩිදුර කළමනාකරණය කරන්න',
  },
  ta: {
    // Tamil translations
    welcome: 'வரவேற்கிறோம்',
    getStarted: 'தொடங்குங்கள்',
    iAlreadyHaveAccount: 'எனக்கு ஏற்கனவே கணக்கு உள்ளது',
    skip: 'தவிர்க்கவும்',
    next: 'அடுத்தது',
    back: 'பின்செல்',
    done: 'முடிந்தது',
    save: 'சேமிக்கவும்',
    cancel: 'ரத்து செய்யவும்',
    yes: 'ஆம்',
    no: 'இல்லை',
    ok: 'சரி',
    
    // Auth
    login: 'உள்நுழைய',
    signup: 'பதிவு செய்யவும்',
    signIn: 'உள்நுழைய',
    createAccount: 'கணக்கை உருவாக்கவும்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    continueAsGuest: 'விருந்தினராகத் தொடரவும்',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    alreadyHaveAccountYes: 'ஏற்கனவே கணக்கு உள்ளதா?',
    register: 'பதிவு செய்யவும்',
    
    // Onboarding
    personalizedLearning: 'தனிப்பயனாக்கப்பட்ட கற்றல்',
    personalizedLearningDesc: 'உங்கள் குழந்தையின் தனித்திறன்கள் மற்றும் ஆர்வங்களுடன் பொருந்தக்கூடிய தகவமைப்பு பாடங்கள்',
    safeSocialPractice: 'பாதுகாப்பான சமூக பயிற்சி',
    safeSocialPracticeDesc: 'நிஜ உலக அழுத்தம் இல்லாமல் மெய்நிகர் சூழல்களில் சமூக திறன்களை பயிற்சி செய்யவும்',
    dailyRoutineSupport: 'தினசரி வழக்க ஆதரவு',
    dailyRoutineSupportDesc: 'மென்மையான தினசரி மாற்றங்களுக்கு காட்சி அட்டவணைகள் மற்றும் மென்மையான நினைவூட்டல்கள்',
    funEducationalGames: 'வேடிக்கையான கல்வி விளையாட்டுகள்',
    funEducationalGamesDesc: 'நம்பிக்கை மற்றும் அறிவாற்றல் திறன்களை உருவாக்கும் ஈர்க்கக்கூடிய விளையாட்டுகள்',
    
    // Dashboard
    dashboard: 'டாஷ்போர்டு',
    hello: 'வணக்கம்',
    readyToLearn: 'இன்று கற்றல் மற்றும் வளர்ச்சிக்கு தயாரா?',
    todaysProgress: 'இன்றைய முன்னேற்றம்',
    learning: 'கற்றல்',
    games: 'விளையாட்டுகள்',
    routine: 'தினசரி நடைமுறை',
    socialSkills: 'சமூக திறன்கள்',
    quickActions: 'விரைவு செயல்கள்',
    continueLearning: 'கற்றலைத் தொடரவும்',
    playGames: 'விளையாடவும்',
    dailyRoutine: 'தினசரி வழக்கம்',
    todaysTasks: 'இன்றைய பணிகள்',
    morningRoutine: 'காலை நடைமுறை',
    learningSession: 'கற்றல் அமர்வு',
    lunchTime: 'மதிய உணவு நேரம்',
    gameTime: 'விளையாட்டு நேரம்',
    eveningRoutine: 'மாலை நடைமுறை',
    recentAchievements: 'சமீபத்திய சாதனைகள்',
    learnedNewWords: 'புதிய சொற்கள் 10 கற்றுக்கொண்டது',
    completedGames: 'விளையாட்டுகள் 5 முடித்தது',
    dayStreak: '7 நாள் தொடர்',
    parentTip: 'இன்றைய பெற்றோர் உதவிக்குறிப்பு',
    parentTipText: '"சிறிய வெற்றிகளைக் கொண்டாட மறக்காதீர்கள்! ஒவ்வொரு முன்னேற்றமும், எவ்வளவு சிறியதாக இருந்தாலும், அங்கீகரிக்கத் தகுந்த முன்னேற்றமாகும்."',
    
    // Learning Screen
    learningJourney: 'கற்றல் பயணம்',
    exploreLessons: 'உங்கள் சொந்த வேகத்தில் பாடங்களை ஆராயவும்',
    continueLearningPickup: 'கற்றலைத் தொடரவும்',
    pickUpWhereLeft: 'நீங்கள் நிறுத்திய இடத்தில் தொடங்கவும்',
    letterAApple: 'எழுத்து அ - ஆப்பிள்',
    learningWordsWithA: 'அ என்ற எழுத்தில் தொடங்கும் சொற்களைக் கற்றல்',
    learningCategories: 'கற்றல் பிரிவுகள்',
    lettersNumbers: 'எழுத்துகள் மற்றும் எண்கள்',
    colorsShapes: 'நிறங்கள் மற்றும் வடிவங்கள்',
    dailyActivities: 'தினசரி செயல்பாடுகள்',
    animalsNature: 'விலங்குகள் மற்றும் இயற்கை',
    emotions: 'உணர்ச்சிகள்',
    socialStories: 'சமூக கதைகள்',
    recommendedForYou: 'உங்களுக்கான பரிந்துரைகள்',
    interactiveStory: 'இடைக்காட்சி கதை: நட்பு டிராகன்',
    countingWithColors: 'நிறங்களுடன் எண்ணுதல்',
    emotionMatchingGame: 'உணர்ச்சி பொருத்தும் விளையாட்டு',
    arLearning: 'AR கற்றல்',
    bringLessonsToLife: 'மேம்படுத்தப்பட்ட யதார்த்தத்துடன் பாடங்களை உயிர்ப்பிக்கவும்',
    startArExperience: 'AR அனுபவத்தைத் தொடங்கவும்',
    lessons: 'பாடங்கள்',
    completed: 'முடிந்தது',
    
    // Games Screen
    funGames: 'வேடிக்கையான விளையாட்டுகள்',
    playLearnGrow: 'விளையாடவும், கற்றுக்கொள்ளவும், வளரவும்!',
    dailyChallenge: 'தினசரி சவால்',
    completeForRewards: 'கூடுதல் பரிசுகளுக்கு முடிக்கவும்',
    completeMemoryGames: 'நினைவக விளையாட்டுகள் 3 முடிக்கவும்',
    rewardStars: 'பரிசு: நட்சத்திரங்கள் 50',
    progress: 'முன்னேற்றம்',
    playNow: 'இப்போது விளையாடவும்',
    allGames: 'அனைத்து விளையாட்டுகளும்',
    memoryMatch: 'நினைவக பொருத்தம்',
    matchPairs: 'அட்டைகளின் ஜோடிகளை பொருத்தவும்',
    colorSorting: 'வண்ண வரிசைப்படுத்தல்',
    sortObjectsByColor: 'பொருள்களை வண்ணத்தின் அடிப்படையில் வரிசைப்படுத்தவும்',
    shapePuzzle: 'வடிவ புதிர்',
    completeShapePuzzles: 'வடிவ புதிர்களை முடிக்கவும்',
    emotionMatch: 'உணர்ச்சி பொருத்தம்',
    matchFacesWithEmotions: 'உணர்ச்சிகளுடன் முகங்களை பொருத்தவும்',
    patternMaker: 'வடிவமைப்பு உருவாக்குநர்',
    createPatterns: 'வடிவங்களை உருவாக்கவும்',
    numberHunt: 'எண் வேட்டை',
    findHiddenNumbers: 'மறைக்கப்பட்ட எண்களைக் கண்டறியவும்',
    recentlyPlayed: 'சமீபத்தில் விளையாடியது',
    playedAgo: '2 மணி நேரத்திற்கு முன்பு விளையாடியது',
    filterByCategory: 'வகைப்படி வடிகட்டவும்:',
    all: 'அனைத்தும்',
    memory: 'நினைவகம்',
    puzzle: 'புதிர்',
    educational: 'கல்வி',
    fun: 'வேடிக்கை',
    socialCat: 'சமூக',
    difficulty: 'சிரமம்',
    stars: 'நட்சத்திரங்கள்',
    easy: 'எளிதானது',
    medium: 'நடுத்தர',
    hard: 'கடினமான',
    
    // Routine Screen
    dailyRoutineTitle: 'தினசரி நடைமுறை',
    todaysSchedule: 'இன்றைய அட்டவணை',
    currentActivity: 'தற்போதைய செயல்பாடு',
    completeDailyLessons: 'உங்கள் தினசரி பாடங்களை முடிக்கவும்',
    start: 'தொடங்கவும்',
    dailyProgress: 'தினசரி முன்னேற்றம்',
    tasksCompleted: 'பணிகள் முடிந்தது',
    wakeUp: 'விழித்தெழுங்கள்',
    brushTeeth: 'பற்களைத் துலக்கவும்',
    breakfast: 'காலை உணவு',
    learningTime: 'கற்றல் நேரம்',
    playTime: 'விளையாட்டு நேரம்',
    lunch: 'மதிய உணவு',
    quietTime: 'அமைதியான நேரம்',
    outdoorPlay: 'வெளிப்புற விளையாட்டு',
    dinner: 'இரவு உணவு',
    bedtime: 'படுக்கை நேரம்',
    upcoming: 'வரவிருக்கிறது',
    addCustomActivity: 'தனிப்பயன் செயல்பாட்டைச் சேர்க்கவும்',
    routineTips: 'வழக்க உதவிக்குறிப்புகள்',
    visualTimers: 'மாற்றங்களுக்கு உதவ காட்சி நேரமானிகளைப் பயன்படுத்தவும்',
    minuteWarnings: 'செயல்பாடு மாறுவதற்கு 5 நிமிட எச்சரிக்கைகளை வழங்கவும்',
    celebrateCompleting: 'ஒவ்வொரு பணியையும் பாராட்டுடன் கொண்டாடுங்கள்',
    keepRoutinesConsistent: 'வழக்கங்களை சீரானதாக வைத்திருங்கள், ஆனால் நெகிழ்வாக இருங்கள்',
    
    // Behavioral Screen
    socialSkillsTraining: 'சமூக திறன்கள் பயிற்சி',
    practiceVirtualEnvironments: 'பாதுகாப்பான மெய்நிகர் சூழல்களில் பயிற்சி செய்யவும்',
    virtualRealityPractice: 'மெய்நிகர் யதார்த்த பயிற்சி',
    safeEnvironmentPractice: 'சமூக பயிற்சிக்கு பாதுகாப்பான சூழல்',
    currentScenario: 'தற்போதைய சூழ்நிலை: பூங்காவில் விளையாடுதல்',
    practiceGreetingFriends: 'நண்பர்களை வாழ்த்துவதையும் பொம்மைகளைப் பகிர்வதையும் பயிற்சி செய்யவும்',
    startVrSession: 'VR அமர்வைத் தொடங்கவும்',
    emotionRecognition: 'உணர்ச்சி அங்கீகாரம்',
    identifyDifferentEmotions: 'வெவ்வேறு உணர்ச்சிகளை அடையாளம் காண கற்றுக்கொள்ளுங்கள்',
    tapToSelect: 'உணர்ச்சியைத் தேர்ந்தெடுக்க தட்டவும்:',
    happy: 'மகிழ்ச்சி',
    sad: 'சோகம்',
    angry: 'கோபம்',
    scared: 'பயம்',
    excited: 'உற்சாகம்',
    calm: 'அமைதி',
    greatYouSelected: 'நல்லது! நீங்கள் தேர்ந்தெடுத்தீர்கள்',
    socialScenarios: 'சமூக சூழ்நிலைகள்',
    greetingFriends: 'நண்பர்களை வாழ்த்துதல்',
    learnHelloGoodbye: 'வணக்கம் மற்றும் பிரியாவிடை சொல்ல கற்றுக்கொள்ளுங்கள்',
    sharingToys: 'பொம்மைகளைப் பகிர்தல்',
    practiceTakingTurns: 'முறை எடுத்துக்கொள்ள பயிற்சி செய்யுங்கள்',
    understandingEmotions: 'உணர்ச்சிகளைப் புரிந்துகொள்ளுதல்',
    recognizeDifferentFeelings: 'வெவ்வேறு உணர்வுகளை அங்கீகரிக்கவும்',
    playingTogether: 'ஒன்றாக விளையாடுதல்',
    groupPlayActivities: 'குழு விளையாட்டு செயல்பாடுகள்',
    dealingWithAnger: 'கோபத்தை சமாளித்தல்',
    calmDownStrategies: 'அமைதிப்படுத்தும் உத்திகள்',
    publicPlaces: 'பொது இடங்கள்',
    behaviorStoresParks: 'கடைகள் மற்றும் பூங்காக்களில் நடத்தை',
    progressTracking: 'முன்னேற்றம் கண்காணிப்பு',
    communication: 'தொடர்பு',
    socialSkillsTips: 'சமூக திறன்கள் உதவிக்குறிப்புகள்',
    useSimpleLanguage: 'எளிமையான, தெளிவான மொழியைப் பயன்படுத்தவும்',
    practiceVisualAids: 'காட்சி உதவிகளுடன் பயிற்சி செய்யவும்',
    roleplayScenarios: 'வெவ்வேறு சூழ்நிலைகளை நாடகமாக்குங்கள்',
    positiveReinforcement: 'நேர்மறையான வலுவூட்டலை வழங்கவும்',
    patientConsistent: 'பொறுமையாகவும் சீரானதாகவும் இருங்கள்',
    
    // Settings
    settings: 'அமைப்புகள்',
    notifications: 'அறிவிப்புகள்',
    theme: 'தீம்',
    language: 'மொழி',
    darkMode: 'இருண்ட பயன்முறை',
    lightMode: 'வெளிர் பயன்முறை',
    english: 'ஆங்கிலம்',
    sinhala: 'சிங்களம்',
    tamil: 'தமிழ்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    editProfile: 'சுயவிவரத்தைத் திருத்து',
    childName: 'குழந்தையின் பெயர்',
    childAge: 'குழந்தையின் வயது',
    parentName: 'பெற்றோரின் பெயர்',
    phone: 'தொலைபேசி எண்',
    notificationsDesc: 'குழந்தையின் முன்னேற்றம் பற்றிய புதுப்பிப்புகளைப் பெறவும்',
    pushNotifications: 'புஷ் அறிவிப்புகள்',
    emailNotifications: 'மின்னஞ்சல் அறிவிப்புகள்',
    soundAlerts: 'ஒலி எச்சரிக்கைகள்',
    vibration: 'அதிர்வு',
    systemDefault: 'கணினி இயல்புநிலை',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    selectTheme: 'தீமைத் தேர்ந்தெடுக்கவும்',
    about: 'பற்றி',
    privacyPolicy: 'தனியுரிமைக் கொள்கை',
    termsOfService: 'சேவை விதிமுறைகள்',
    help: 'உதவி',
    contactSupport: 'ஆதரவைத் தொடர்பு கொள்ளவும்',
    version: 'பதிப்பு',
    areYouSureLogout: 'நீங்கள் உள்நுழைந்து வெளியேற விரும்புகிறீர்களா?',
    profileUpdated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
    
    // Profile
    changePhoto: 'புகைப்படத்தை மாற்றவும்',
    childInformation: 'குழந்தை தகவல்',
    age: 'வயது',
    gender: 'பாலினம்',
    years: 'ஆண்டுகள்',
    appSettings: 'பயன்பாட்டு அமைப்புகள்',
    manageSettings: 'அறிவிப்புகள், மொழி, தீம் மற்றும் பலவற்றை நிர்வகிக்கவும்',
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
        // Auto-detect device language using expo-localization
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
    // Get translation from current language
    const langTranslations = translations[language];
    
    // Check if key exists in current language
    let translation = (langTranslations as any)[key];
    
    // If translation not found, try English as fallback
    if (!translation && language !== 'en') {
      translation = (translations.en as any)[key];
    }
    
    // If still not found, return the key itself
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    // Simple parameter replacement
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

  // Return loading state if needed
  if (isLoading) {
    return null; // Or a loading spinner
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

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' },
  ];
};