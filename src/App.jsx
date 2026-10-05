import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Timer,
  CalendarDays,
  Settings,
  Clock,
  Sparkles,
  Search,
  FileText,
  Volume2,
  VolumeX,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Quote as QuoteIcon,
  Zap
} from 'lucide-react';
import DailyStudyHours from './DailyStudyHours.jsx';
import StudyTimer from './StudyTimer.jsx';
import { EXAM_DATE, STUDY_START_DATE, toDateKey } from './studyHours.js';

// ==========================================
// 1. CONSTANTS & DATABASE
// ==========================================

const SUBJECTS = {
  PHYSICS: { name: 'Physics', code: 'PHY', color: '#1E40AF', totalChapters: 20 },
  CHEMISTRY: { name: 'Chemistry', code: 'CHEM', color: '#6D28D9', totalChapters: 10 },
  HIGHER_MATH: { name: 'Higher Mathematics', code: 'MATH', color: '#B91C1C', totalChapters: 20 }
};

const CHAPTERS_DATA = [
  // PHYSICS 1ST PAPER (10 Chapters)
  { id: 'p1_1', subject: 'Physics', paper: '1st', num: 1, titleBn: 'ভৌত জগত ও পরিমাপ', titleEn: 'Physical World & Measurement' },
  { id: 'p1_2', subject: 'Physics', paper: '1st', num: 2, titleBn: 'ভেক্টর', titleEn: 'Vectors' },
  { id: 'p1_3', subject: 'Physics', paper: '1st', num: 3, titleBn: 'গতিবিদ্যা', titleEn: 'Dynamics' },
  { id: 'p1_4', subject: 'Physics', paper: '1st', num: 4, titleBn: 'নিউটনীয় বলবিদ্যা', titleEn: 'Newtonian Mechanics' },
  { id: 'p1_5', subject: 'Physics', paper: '1st', num: 5, titleBn: 'কাজ, শক্তি ও ক্ষমতা', titleEn: 'Work, Energy & Power' },
  { id: 'p1_6', subject: 'Physics', paper: '1st', num: 6, titleBn: 'মহাকর্ষ ও অভিকর্ষ', titleEn: 'Gravitation' },
  { id: 'p1_7', subject: 'Physics', paper: '1st', num: 7, titleBn: 'পদার্থের গাঠনিক ধর্ম', titleEn: 'Structural Properties of Matter' },
  { id: 'p1_8', subject: 'Physics', paper: '1st', num: 8, titleBn: 'পর্যাবৃত্ত গতি', titleEn: 'Periodic Motion' },
  { id: 'p1_9', subject: 'Physics', paper: '1st', num: 9, titleBn: 'তরঙ্গ', titleEn: 'Waves' },
  { id: 'p1_10', subject: 'Physics', paper: '1st', num: 10, titleBn: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', titleEn: 'Ideal Gas & Kinetic Theory of Gases' },

  // PHYSICS 2ND PAPER (10 Chapters)
  { id: 'p2_1', subject: 'Physics', paper: '2nd', num: 1, titleBn: 'তাপগতিবিদ্যা', titleEn: 'Thermodynamics' },
  { id: 'p2_2', subject: 'Physics', paper: '2nd', num: 2, titleBn: 'স্থির তড়িৎ', titleEn: 'Electrostatics' },
  { id: 'p2_3', subject: 'Physics', paper: '2nd', num: 3, titleBn: 'চল তড়িৎ', titleEn: 'Current Electricity' },
  { id: 'p2_4', subject: 'Physics', paper: '2nd', num: 4, titleBn: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া', titleEn: 'Magnetic Effects of Current' },
  { id: 'p2_5', subject: 'Physics', paper: '2nd', num: 5, titleBn: 'তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', titleEn: 'Electromagnetic Induction & Alternating Current' },
  { id: 'p2_6', subject: 'Physics', paper: '2nd', num: 6, titleBn: 'জ্যামিতিক আলোকবিজ্ঞান', titleEn: 'Geometrical Optics' },
  { id: 'p2_7', subject: 'Physics', paper: '2nd', num: 7, titleBn: 'ভৌত আলোকবিজ্ঞান', titleEn: 'Physical Optics' },
  { id: 'p2_8', subject: 'Physics', paper: '2nd', num: 8, titleBn: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', titleEn: 'Introduction to Modern Physics' },
  { id: 'p2_9', subject: 'Physics', paper: '2nd', num: 9, titleBn: 'পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান', titleEn: 'Atomic Model & Nuclear Physics' },
  { id: 'p2_10', subject: 'Physics', paper: '2nd', num: 10, titleBn: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', titleEn: 'Semiconductor & Electronics' },

  // CHEMISTRY 1ST PAPER (5 Chapters)
  { id: 'c1_1', subject: 'Chemistry', paper: '1st', num: 1, titleBn: 'ল্যাবরেটরির নিরাপদ ব্যবহার', titleEn: 'Safe Use of Laboratory' },
  { id: 'c1_2', subject: 'Chemistry', paper: '1st', num: 2, titleBn: 'গুণগত রসায়ন', titleEn: 'Qualitative Chemistry' },
  { id: 'c1_3', subject: 'Chemistry', paper: '1st', num: 3, titleBn: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', titleEn: 'Periodic Properties of Elements & Chemical Bonding' },
  { id: 'c1_4', subject: 'Chemistry', paper: '1st', num: 4, titleBn: 'রাসায়নিক পরিবর্তন', titleEn: 'Chemical Change' },
  { id: 'c1_5', subject: 'Chemistry', paper: '1st', num: 5, titleBn: 'কর্মমুখী রসায়ন', titleEn: 'Applied/Working Chemistry' },

  // CHEMISTRY 2ND PAPER (5 Chapters)
  { id: 'c2_1', subject: 'Chemistry', paper: '2nd', num: 1, titleBn: 'পরিবেশ রসায়ন', titleEn: 'Environmental Chemistry' },
  { id: 'c2_2', subject: 'Chemistry', paper: '2nd', num: 2, titleBn: 'জৈব রসায়ন', titleEn: 'Organic Chemistry' },
  { id: 'c2_3', subject: 'Chemistry', paper: '2nd', num: 3, titleBn: 'পরিমাণগত রসায়ন', titleEn: 'Quantitative Chemistry' },
  { id: 'c2_4', subject: 'Chemistry', paper: '2nd', num: 4, titleBn: 'তড়িৎ রসায়ন', titleEn: 'Electrochemistry' },
  { id: 'c2_5', subject: 'Chemistry', paper: '2nd', num: 5, titleBn: 'অর্থনৈতিক রসায়ন', titleEn: 'Economic Chemistry' },

  // HIGHER MATH 1ST PAPER (10 Chapters)
  { id: 'm1_1', subject: 'Higher Mathematics', paper: '1st', num: 1, titleBn: 'ম্যাট্রিক্স ও নির্ণায়ক', titleEn: 'Matrices & Determinants' },
  { id: 'm1_2', subject: 'Higher Mathematics', paper: '1st', num: 2, titleBn: 'ভেক্টর', titleEn: 'Vectors' },
  { id: 'm1_3', subject: 'Higher Mathematics', paper: '1st', num: 3, titleBn: 'সরলরেখা', titleEn: 'Straight Line' },
  { id: 'm1_4', subject: 'Higher Mathematics', paper: '1st', num: 4, titleBn: 'বৃত্ত', titleEn: 'Circle' },
  { id: 'm1_5', subject: 'Higher Mathematics', paper: '1st', num: 5, titleBn: 'বিন্যাস ও সমাবেশ', titleEn: 'Permutation & Combination' },
  { id: 'm1_6', subject: 'Higher Mathematics', paper: '1st', num: 6, titleBn: 'ত্রিকোণমিতিক অনুপাত', titleEn: 'Trigonometric Ratios' },
  { id: 'm1_7', subject: 'Higher Mathematics', paper: '1st', num: 7, titleBn: 'ত্রিকোণমিতিক অনুপাতের সম্পর্কিত কোণ', titleEn: 'Trigonometric Ratios of Associated Angles' },
  { id: 'm1_8', subject: 'Higher Mathematics', paper: '1st', num: 8, titleBn: 'ফাংশন ও ফাংশনের লেখচিত্র', titleEn: 'Functions & Graphs of Functions' },
  { id: 'm1_9', subject: 'Higher Mathematics', paper: '1st', num: 9, titleBn: 'অন্তরীকরণ', titleEn: 'Differentiation' },
  { id: 'm1_10', subject: 'Higher Mathematics', paper: '1st', num: 10, titleBn: 'সমাকলন', titleEn: 'Integration' },

  // HIGHER MATH 2ND PAPER (10 Chapters)
  { id: 'm2_1', subject: 'Higher Mathematics', paper: '2nd', num: 1, titleBn: 'বাস্তব সংখ্যা ও অসমতা', titleEn: 'Real Numbers & Inequalities' },
  { id: 'm2_2', subject: 'Higher Mathematics', paper: '2nd', num: 2, titleBn: 'যোগাশ্রয়ী প্রোগ্রাম', titleEn: 'Linear Programming' },
  { id: 'm2_3', subject: 'Higher Mathematics', paper: '2nd', num: 3, titleBn: 'জটিল সংখ্যা', titleEn: 'Complex Numbers' },
  { id: 'm2_4', subject: 'Higher Mathematics', paper: '2nd', num: 4, titleBn: 'বহুপদী ও বহুপদী সমীকরণ', titleEn: 'Polynomial & Polynomial Equations' },
  { id: 'm2_5', subject: 'Higher Mathematics', paper: '2nd', num: 5, titleBn: 'দ্বিপদী বিস্তৃতি', titleEn: 'Binomial Expansion' },
  { id: 'm2_6', subject: 'Higher Mathematics', paper: '2nd', num: 6, titleBn: 'কনিক', titleEn: 'Conics' },
  { id: 'm2_7', subject: 'Higher Mathematics', paper: '2nd', num: 7, titleBn: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ', titleEn: 'Inverse Trigonometric Functions & Equations' },
  { id: 'm2_8', subject: 'Higher Mathematics', paper: '2nd', num: 8, titleBn: 'স্থিতিবিদ্যা', titleEn: 'Statics' },
  { id: 'm2_9', subject: 'Higher Mathematics', paper: '2nd', num: 9, titleBn: 'সমতলে বস্তুকণার গতি', titleEn: 'Motion of Particles in a Plane' },
  { id: 'm2_10', subject: 'Higher Mathematics', paper: '2nd', num: 10, titleBn: 'বিস্তারের পরিমাপ ও সম্ভাবনা', titleEn: 'Measures of Dispersion & Probability' }
];

const MOTIVATIONAL_QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "Discipline" },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "Mindset" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", category: "Focus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", category: "Action" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "Consistency" },
  { text: "Genius is 1% talent and 99% hard work.", author: "Albert Einstein", category: "Effort" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Perseverance" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Belief" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou", category: "Resilience" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", category: "Inner Power" },
  { text: "Whether you think you can, or you think you can't – you're right.", author: "Henry Ford", category: "Mindset" },
  { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee", category: "Mastery" },
  { text: "I've failed over and over and over again in my life. And that is why I succeed.", author: "Michael Jordan", category: "Growth" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Passion" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "Perseverance" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "Action" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "Resilience" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese Proverb", category: "Action" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin", category: "Action" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "Persistence" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin", category: "Focus" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "Purpose" },
  { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche", category: "Resilience" },
  { text: "What stands in the way becomes the way.", author: "Marcus Aurelius", category: "Resilience" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", category: "Action" },
  { text: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius", category: "Integrity" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca", category: "Growth" },
  { text: "While we are postponing, life speeds by.", author: "Seneca", category: "Action" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", category: "Mindset" },
  { text: "No man is free who is not master of himself.", author: "Epictetus", category: "Discipline" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus", category: "Contentment" },
  { text: "Well begun is half done.", author: "Aristotle", category: "Action" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle", category: "Learning" },
  { text: "The unexamined life is not worth living.", author: "Socrates", category: "Reflection" },
  { text: "Courage is knowing what not to fear.", author: "Plato", category: "Courage" },
  { text: "The beginning is the most important part of the work.", author: "Plato", category: "Action" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Consistency" },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius", category: "Humility" },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius", category: "Resilience" },
  { text: "Mastering others is strength; mastering yourself is true power.", author: "Lao Tzu", category: "Self-Mastery" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", category: "Patience" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", category: "Action" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi", category: "Willpower" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "Action" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "Learning" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "Learning" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela", category: "Courage" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie", category: "Courage" },
  { text: "Life is not easy for any of us. But what of that? We must have perseverance.", author: "Marie Curie", category: "Perseverance" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein", category: "Creativity" },
  { text: "Try not to become a man of success, but rather try to become a man of value.", author: "Albert Einstein", category: "Purpose" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Opportunity" },
  { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", author: "Albert Einstein", category: "Momentum" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "Persistence" },
  { text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison", category: "Effort" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas Edison", category: "Perseverance" },
  { text: "If you're going through hell, keep going.", author: "Winston Churchill", category: "Perseverance" },
  { text: "To improve is to change; to be perfect is to change often.", author: "Winston Churchill", category: "Growth" },
  { text: "Attitude is a little thing that makes a big difference.", author: "Winston Churchill", category: "Mindset" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt", category: "Courage" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "Belief" },
  { text: "A smooth sea never made a skilled sailor.", author: "Franklin D. Roosevelt", category: "Resilience" },
  { text: "You must do the thing you think you cannot do.", author: "Eleanor Roosevelt", category: "Courage" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt", category: "Self-Worth" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Dreams" },
  { text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt", category: "Courage" },
  { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt", category: "Balance" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "Action" },
  { text: "Whatever you are, be a good one.", author: "Abraham Lincoln", category: "Excellence" },
  { text: "I am a slow walker, but I never walk back.", author: "Abraham Lincoln", category: "Persistence" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "Action" },
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Action" },
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney", category: "Dreams" },
  { text: "Coming together is a beginning, staying together is progress, and working together is success.", author: "Henry Ford", category: "Teamwork" },
  { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford", category: "Growth" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Curiosity" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Authenticity" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Innovation" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Action" },
  { text: "Courage is resistance to fear, mastery of fear - not absence of fear.", author: "Mark Twain", category: "Courage" },
  { text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do.", author: "H. Jackson Brown Jr.", category: "Courage" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Action" },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins", category: "Goals" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar", category: "Growth" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "Action" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", category: "Habit" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Persistence" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "Consistency" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "Discipline" },
  { text: "We must all suffer one of two things: the pain of discipline or the pain of regret.", author: "Jim Rohn", category: "Discipline" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn", category: "Focus" },
  { text: "Formal education will make you a living; self-education will make you a fortune.", author: "Jim Rohn", category: "Learning" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "Health" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "Effort" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn", category: "Effort" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale", category: "Accountability" },
  { text: "It's hard to beat a person who never gives up.", author: "Babe Ruth", category: "Perseverance" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "Action" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", category: "Mastery" },
  { text: "I can accept failure, everyone fails at something. But I can't accept not trying.", author: "Michael Jordan", category: "Courage" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "Focus" },
  { text: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali", category: "Courage" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi", category: "Resilience" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi", category: "Excellence" },
  { text: "Do not let what you cannot do interfere with what you can do.", author: "John Wooden", category: "Focus" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "Action" },
  { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson", category: "Passion" },
  { text: "Make the most of yourself, for that is all there is of you.", author: "Ralph Waldo Emerson", category: "Potential" },
  { text: "Do the thing and you will have the power.", author: "Ralph Waldo Emerson", category: "Action" },
  { text: "Go confidently in the direction of your dreams! Live the life you've imagined.", author: "Henry David Thoreau", category: "Dreams" },
  { text: "Things do not change; we change.", author: "Henry David Thoreau", category: "Growth" },
  { text: "It's not what you look at that matters, it's what you see.", author: "Henry David Thoreau", category: "Perspective" },
  { text: "What we think, we become.", author: "Buddha", category: "Mindset" },
  { text: "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.", author: "Buddha", category: "Self-Reliance" },
  { text: "Be water, my friend.", author: "Bruce Lee", category: "Adaptability" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "Focus" },
  { text: "A goal is not always meant to be reached; it often serves simply as something to aim at.", author: "Bruce Lee", category: "Goals" },
  { text: "If you don't like the road you're walking, start paving another one.", author: "Dolly Parton", category: "Change" },
  { text: "Find out who you are and do it on purpose.", author: "Dolly Parton", category: "Purpose" },
  { text: "Nothing will work unless you do.", author: "Maya Angelou", category: "Effort" },
  { text: "Do the best you can until you know better. Then when you know better, do better.", author: "Maya Angelou", category: "Growth" },
  { text: "If you don't like something, change it. If you can't change it, change your attitude.", author: "Maya Angelou", category: "Mindset" },
  { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Les Brown", category: "Ambition" },
  { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder", category: "Effort" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "Opportunity" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh", category: "Consistency" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey", category: "Accountability" },
  { text: "Begin with the end in mind.", author: "Stephen Covey", category: "Planning" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey", category: "Focus" },
  { text: "Ability is what you're capable of doing. Motivation determines what you do.", author: "Lou Holtz", category: "Motivation" },
  { text: "Mistakes are the portals of discovery.", author: "James Joyce", category: "Growth" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb", category: "Action" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "Action" },
  { text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'", author: "Mary Anne Radmacher", category: "Courage" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston", category: "Action" },
  { text: "Great minds have purposes, others have wishes.", author: "Washington Irving", category: "Purpose" },
  { text: "Courage is grace under pressure.", author: "Ernest Hemingway", category: "Courage" },
  { text: "Fortune favors the bold.", author: "Virgil", category: "Courage" },
  { text: "He who fears he shall suffer, already suffers what he fears.", author: "Michel de Montaigne", category: "Fear" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem", category: "Belief" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "Growth" },
  { text: "A river cuts through rock not because of its power, but because of its persistence.", author: "Jim Watkins", category: "Persistence" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A. A. Milne", category: "Self-Belief" },
  { text: "Hope is a good breakfast, but it is a bad supper.", author: "Francis Bacon", category: "Hope" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien", category: "Purpose" },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien", category: "Consistency" },
  { text: "It is our choices that show what we truly are, far more than our abilities.", author: "J.K. Rowling", category: "Choices" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "Courage" },
  { text: "Failure will never overtake me if my determination to succeed is strong enough.", author: "Og Mandino", category: "Determination" },
  { text: "The harder the conflict, the more glorious the triumph.", author: "Thomas Paine", category: "Perseverance" }
  ,
  { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett", category: "Purpose" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon", category: "Effort" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James", category: "Action" },
  { text: "Believe that life is worth living, and your belief will help create the fact.", author: "William James", category: "Belief" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James", category: "Mindset" },
  { text: "Nothing is impossible; the word itself says 'I'm possible!'", author: "Audrey Hepburn", category: "Belief" },
  { text: "Success is a journey, not a destination.", author: "Ben Sweetland", category: "Journey" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington", category: "Kindness" },
  { text: "Character cannot be developed in ease and quiet.", author: "Helen Keller", category: "Growth" },
  { text: "Although the world is full of suffering, it is full also of the overcoming of it.", author: "Helen Keller", category: "Resilience" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman", category: "Optimism" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot", category: "Growth" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "Happiness" },
  { text: "Our greatest fear should not be of failure but of succeeding at things in life that don't really matter.", author: "Francis Chan", category: "Purpose" },
  { text: "Optimism is the faith that leads to achievement.", author: "Helen Keller", category: "Optimism" },
  { text: "Strength and growth come only through continuous effort and struggle.", author: "Napoleon Hill", category: "Growth" },
  { text: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill", category: "Belief" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson", category: "Excellence" },
  { text: "Success is the progressive realization of a worthy goal or ideal.", author: "Earl Nightingale", category: "Goals" },
  { text: "We become what we think about most of the time.", author: "Earl Nightingale", category: "Mindset" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou", category: "Creativity" },
  { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso", category: "Creativity" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "Action" },
  { text: "Whenever you find yourself on the side of the majority, it is time to pause and reflect.", author: "Mark Twain", category: "Independence" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch", category: "Inner Power" },
  { text: "A man who dares to waste one hour of time has not discovered the value of life.", author: "Charles Darwin", category: "Time" },
  { text: "The more I practice, the luckier I get.", author: "Gary Player", category: "Practice" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali", category: "Perseverance" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson", category: "Consistency" },
  { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels", category: "Effort" },
  { text: "You can't cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore", category: "Action" },
  { text: "Faith is the bird that feels the light when the dawn is still dark.", author: "Rabindranath Tagore", category: "Hope" },
  { text: "Let us sacrifice our today so that our children can have a better tomorrow.", author: "A. P. J. Abdul Kalam", category: "Sacrifice" },
  { text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "A. P. J. Abdul Kalam", category: "Dreams" },
  { text: "If you want to shine like a sun, first burn like a sun.", author: "A. P. J. Abdul Kalam", category: "Effort" },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda", category: "Perseverance" },
  { text: "You cannot believe in God until you believe in yourself.", author: "Swami Vivekananda", category: "Self-Belief" },
  { text: "The greatest mistake you can make in life is to be continually fearing you will make one.", author: "Elbert Hubbard", category: "Fear" },
  { text: "There is no failure except in no longer trying.", author: "Elbert Hubbard", category: "Perseverance" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall", category: "Action" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "Happiness" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll", category: "Mindset" },
  { text: "The only thing worse than starting something and failing is not starting something.", author: "Seth Godin", category: "Action" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot", category: "Perseverance" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West", category: "Living" },
  { text: "Limit your 'always' and your 'nevers.'", author: "Amy Poehler", category: "Mindset" },
  { text: "Doing the best at this moment puts you in the best place for the next moment.", author: "Oprah Winfrey", category: "Presence" },
  { text: "The biggest adventure you can take is to live the life of your dreams.", author: "Oprah Winfrey", category: "Dreams" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey", category: "Growth" },
  { text: "If you want the rainbow, you gotta put up with the rain.", author: "Dolly Parton", category: "Patience" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar", category: "Mindset" }
];


const INITIAL_CHAPTER_STATE = {
  done: false,
  revisionNotNeeded: false,
  mcqDone: false,
  cqDone: false,
  admissionReady: false,
  notes: ''
};

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  soundEnabled: true
};

// ==========================================
// 2. HELPER UTILITIES
// ==========================================

const STUDY_GOAL_STORAGE_KEY = 'hsc_pcm_overall_study_goal_hours';
const DEFAULT_STUDY_GOAL_HOURS = 600;

const getInitialTrackerData = () => {
  const saved = localStorage.getItem('hsc_pcm_tracker_data');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  const initial = {};
  CHAPTERS_DATA.forEach(ch => { initial[ch.id] = { ...INITIAL_CHAPTER_STATE }; });
  return initial;
};

const getInitialSettings = () => {
  const saved = localStorage.getItem('hsc_pcm_pomodoro_settings');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return DEFAULT_SETTINGS;
};

const getInitialStudyGoalHours = () => {
  const savedGoal = localStorage.getItem(STUDY_GOAL_STORAGE_KEY);
  if (savedGoal === null) return DEFAULT_STUDY_GOAL_HOURS;

  const goalHours = Number(savedGoal);
  return Number.isFinite(goalHours) && goalHours > 0
    ? goalHours
    : DEFAULT_STUDY_GOAL_HOURS;
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

// BANGLADESH CLOCK COMPONENT
const DhakaClock = () => {
  const [timeState, setTimeState] = useState({ timeStr: '--:--:--', dateStr: '', dayStr: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        weekday: 'long'
      });

      setTimeState({
        timeStr: timeFormatter.format(now),
        dateStr: dateFormatter.format(now),
        dayStr: dayFormatter.format(now)
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-[#111827] border border-[#1F2937] px-4 py-2.5 rounded-2xl shadow-inner">
      <div className="p-2 rounded-xl bg-[#FB7185]/10 text-[#FB7185]">
        <Clock className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-extrabold tracking-wider font-mono text-[#F8FAFC]">
            {timeState.timeStr}
          </span>

        </div>
        <div className="text-xs text-[#94A3B8]">
          {timeState.dayStr}, {timeState.dateStr}
        </div>
      </div>
    </div>
  );
};

// MOTIVATIONAL QUOTE CARD COMPONENT
const QuoteCard = ({ categoryFilter = null, variant = 'standard' }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const filteredQuotes = useMemo(() => {
    if (!categoryFilter) return MOTIVATIONAL_QUOTES;
    const matches = MOTIVATIONAL_QUOTES.filter(q => q.category.toLowerCase() === categoryFilter.toLowerCase());
    return matches.length > 0 ? matches : MOTIVATIONAL_QUOTES;
  }, [categoryFilter]);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setQuoteIndex(dayOfYear % filteredQuotes.length);
  }, [filteredQuotes]);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
  };

  const currentQuote = filteredQuotes[quoteIndex] || MOTIVATIONAL_QUOTES[0];

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F2937] text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <QuoteIcon className="w-4 h-4 text-[#FB7185] shrink-0 italic" />
          <p className="text-[#94A3B8] italic truncate h-auto">
            "{currentQuote.text}" — <span className="text-[#F8FAFC] not-italic font-medium">{currentQuote.author}</span>
          </p>
        </div>
        <button
          onClick={nextQuote}
          title="Shuffle quote"
          className="p-1 cursor-pointer rounded-lg hover:bg-[#1F2937] text-[#64748B] hover:text-[#FB7185] transition-colors shrink-0 focus:outline-none focus:ring-1 focus:ring-[#FB7185]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111827] via-[#0D1320] to-[#111827] border border-[#1F2937] p-5 shadow-lg group">
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 text-[#FB7185] pointer-events-none">
        <QuoteIcon className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3.5 items-start">
          <div className="p-2.5 rounded-xl bg-[#FB7185]/10 text-[#FB7185] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FB7185] bg-[#FB7185]/10 px-2 py-0.5 rounded-md">
                {currentQuote.category}
              </span>
              <span className="text-xs text-[#64748B]">Daily Study Inspiration</span>
            </div>
            <p className="text-[#F8FAFC] text-sm sm:text-base font-medium italic leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-xs text-[#94A3B8] mt-1.5 font-semibold not-italic">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        <button
          onClick={nextQuote}
          className="cursor-pointer self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F2937]/80 hover:bg-[#1F2937] text-xs text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1F2937] transition-all shrink-0 focus:outline-none focus:ring-1 focus:ring-[#FB7185]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FB7185]" />
          <span>New Quote</span>
        </button>
      </div>
    </div>
  );
};

// SVG DONUT CHART COMPONENT
const SvgDonutChart = ({ title, data, totalChapters, completedTotal }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = data.map((item) => {
    const percentage = totalChapters > 0 ? (item.count / totalChapters) : 0;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percentage;

    return {
      ...item,
      percentage: Math.round(totalChapters > 0 ? (item.count / totalChapters) * 100 : 0),
      subjectPercent: Math.round(item.max > 0 ? (item.count / item.max) * 100 : 0),
      strokeDasharray,
      strokeDashoffset
    };
  });

  const overallPercentage = Math.round((completedTotal / totalChapters) * 100);

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-[#F8FAFC] mb-1">{title}</h3>
        <p className="text-xs text-[#64748B]">Combined 1st & 2nd Paper Breakdown</p>
      </div>

      <div className="relative my-6 flex justify-center items-center">
        <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 200 200" aria-label={title}>
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#1F2937"
            strokeWidth="28"
          />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredSlice === idx ? "34" : "28"}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredSlice(idx)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-[#F8FAFC]">{overallPercentage}%</span>
          <span className="text-xs font-semibold text-[#94A3B8]">
            {completedTotal} / {totalChapters} PCM
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-[#1F2937]">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${hoveredSlice === idx ? 'bg-[#1F2937]' : ''
              }`}
            onMouseEnter={() => setHoveredSlice(idx)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
              <span className="text-xs font-medium text-[#F8FAFC]">{slice.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#F8FAFC]">{slice.count}/{slice.max}</span>
              <span className="text-[11px] text-[#94A3B8] ml-2">({slice.subjectPercent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// RESET CONFIRMATION MODAL
const ResetModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-[#EF4444]/40 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-[#EF4444]">
          <div className="p-3 rounded-xl bg-[#EF4444]/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#F8FAFC]">Reset All Progress?</h3>
            <p className="text-xs text-[#94A3B8]">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Are you sure you want to clear chapter progress, personal notes, daily study hours, and the active timer? Consider exporting a backup first.
        </p>

        <div className="cursor-pointer flex justify-end gap-3 pt-3 border-t border-[#1F2937]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1F2937] text-xs font-semibold text-[#F8FAFC] hover:bg-[#1F2937]/80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 rounded-xl bg-[#EF4444] text-xs font-semibold text-white hover:bg-[#EF4444]/90 shadow-lg shadow-[#EF4444]/20"
          >
            Yes, Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trackerData, setTrackerData] = useState(getInitialTrackerData);
  const [pomodoroSettings, setPomodoroSettings] = useState(getInitialSettings);
  const [dailyStudyData, setDailyStudyData] = useState({});
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => {
    const savedGoal = Number(localStorage.getItem('hsc_pcm_daily_study_goal_minutes'));
    return Number.isFinite(savedGoal) ? Math.max(0, Math.min(1440, Math.round(savedGoal))) : 0;
  });
  const [studyGoalHours, setStudyGoalHours] = useState(getInitialStudyGoalHours);
  const [studyTimeEditor, setStudyTimeEditor] = useState(() => () => { });
  const [resetStudyClock, setResetStudyClock] = useState(() => () => { });
  const [restoreStudyData, setRestoreStudyData] = useState(() => () => { });
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));

  // Filters State
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [paperFilter, setPaperFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});

  // Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Save tracker data on change
  useEffect(() => {
    localStorage.setItem('hsc_pcm_tracker_data', JSON.stringify(trackerData));
  }, [trackerData]);

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('hsc_pcm_pomodoro_settings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

  useEffect(() => {
    localStorage.setItem('hsc_pcm_daily_study_goal_minutes', String(dailyGoalMinutes));
  }, [dailyGoalMinutes]);

  useEffect(() => {
    localStorage.setItem(STUDY_GOAL_STORAGE_KEY, String(studyGoalHours));
  }, [studyGoalHours]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextDateKey = toDateKey(new Date());
      setTodayKey((currentDateKey) => nextDateKey === currentDateKey ? currentDateKey : nextDateKey);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleStudyDataChange = useCallback((nextStudyData) => {
    setDailyStudyData(nextStudyData);
  }, []);

  const handleStudyTimeEditorReady = useCallback((editStudyTime) => {
    setStudyTimeEditor(() => editStudyTime);
  }, []);

  const handleStudyClockResetReady = useCallback((resetClock) => {
    setResetStudyClock(() => resetClock);
  }, []);

  const handleStudyDataRestoreReady = useCallback((restoreData) => {
    setRestoreStudyData(() => restoreData);
  }, []);

  // Checkbox Handler
  const toggleCheckbox = (id, key) => {
    setTrackerData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: !prev[id]?.[key]
      }
    }));
  };

  // Note Handler
  const handleNoteChange = (id, text) => {
    setTrackerData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: text
      }
    }));
  };

  // Dynamic Metrics Calculation Engine
  const metrics = useMemo(() => {
    let totalDone = 0;
    let totalAdmission = 0;
    let totalNeedsRevision = 0;
    let totalMcq = 0;
    let totalCq = 0;

    const subjects = {
      Physics: { done: 0, admission: 0, mcq: 0, cq: 0, revisionNeeded: 0, total: 20 },
      Chemistry: { done: 0, admission: 0, mcq: 0, cq: 0, revisionNeeded: 0, total: 10 },
      'Higher Mathematics': { done: 0, admission: 0, mcq: 0, cq: 0, revisionNeeded: 0, total: 20 }
    };

    CHAPTERS_DATA.forEach(ch => {
      const state = trackerData[ch.id] || INITIAL_CHAPTER_STATE;
      const sub = subjects[ch.subject];

      if (state.done) {
        totalDone++;
        sub.done++;
      }
      if (state.admissionReady) {
        totalAdmission++;
        sub.admission++;
      }
      if (state.mcqDone) {
        totalMcq++;
        sub.mcq++;
      }
      if (state.cqDone) {
        totalCq++;
        sub.cq++;
      }
      if (state.done && !state.revisionNotNeeded) {
        totalNeedsRevision++;
        sub.revisionNeeded++;
      }
    });

    return {
      totalDone,
      totalAdmission,
      totalNeedsRevision,
      totalMcq,
      totalCq,
      overallHscPercent: Math.round((totalDone / 50) * 100),
      overallAdmissionPercent: Math.round((totalAdmission / 50) * 100),
      subjects
    };
  }, [trackerData]);

  // Filtered Chapters for Tracker View
  const filteredChapters = useMemo(() => {
    return CHAPTERS_DATA.filter(ch => {
      const state = trackerData[ch.id] || INITIAL_CHAPTER_STATE;

      if (subjectFilter !== 'All' && ch.subject !== subjectFilter) return false;
      if (paperFilter !== 'All' && ch.paper !== paperFilter) return false;

      if (statusFilter === 'Needs Revision') {
        if (!(state.done && !state.revisionNotNeeded)) return false;
      } else if (statusFilter === 'Incomplete') {
        if (state.done) return false;
      } else if (statusFilter === 'Admission Ready') {
        if (!state.admissionReady) return false;
      } else if (statusFilter === 'Done') {
        if (!state.done) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesBn = ch.titleBn.toLowerCase().includes(q);
        const matchesEn = ch.titleEn.toLowerCase().includes(q);
        const matchesNum = ch.num.toString() === q;
        if (!matchesBn && !matchesEn && !matchesNum) return false;
      }

      return true;
    });
  }, [trackerData, subjectFilter, paperFilter, statusFilter, searchQuery]);

  // Export / Import Progress Data
  const handleExportData = () => {
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      trackerData,
      pomodoroSettings,
      dailyStudyData,
      dailyGoalMinutes,
      studyGoalHours
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSC_2026_PCM_Tracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.trackerData) setTrackerData(json.trackerData);
        if (json.pomodoroSettings) setPomodoroSettings(json.pomodoroSettings);
        if (json.dailyStudyData) restoreStudyData(json.dailyStudyData);
        if (Number.isFinite(json.dailyGoalMinutes)) {
          setDailyGoalMinutes(Math.max(0, Math.min(1440, Math.round(json.dailyGoalMinutes))));
        }
        if (Number.isFinite(json.studyGoalHours) && json.studyGoalHours > 0) {
          setStudyGoalHours(json.studyGoalHours);
        }
        alert('Progress backup restored successfully!');
      } catch (err) {
        console.error('Could not restore progress backup:', err);
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    const initial = {};
    CHAPTERS_DATA.forEach(ch => { initial[ch.id] = { ...INITIAL_CHAPTER_STATE }; });
    setTrackerData(initial);
    localStorage.removeItem('hsc_pcm_tracker_data');
    resetStudyClock();
    setIsResetModalOpen(false);
  };

  return (
    <div className="app-shell min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col md:flex-row antialiased selection:bg-[#FB7185]/30 selection:text-[#FB7185]">

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION                 */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1F2937] bg-[#0D1320] p-5 shrink-0 justify-between sticky top-0 h-screen">
        <div>
          {/* Logo Header */}
          <div className="flex items-center justify-center px-2 py-3 mb-6 border-b border-[#1F2937]">
            <img
              src="/logoS.png"
              alt="HSC 2026 PCM Study Tracker"
              className="h-16 w-auto object-contain drop-shadow-[0_0_18px_rgba(251,113,133,0.35)]"
            />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'chapters', label: 'Chapters', icon: BookOpen, badge: '50' },
              { id: 'progress', label: 'Progress & Charts', icon: BarChart3 },
              { id: 'study-hours', label: 'Daily Study Hours', icon: CalendarDays },
              { id: 'pomodoro', label: 'Study Timer', icon: Timer },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive
                      ? 'bg-[#111827] text-[#FB7185] border border-[#FB7185]/30 shadow-lg shadow-[#FB7185]/5'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FB7185]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F2937] text-[#64748B]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAVIGATION                   */}
      {/* ========================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1320] border-t border-[#1F2937] px-3 py-2 flex justify-around items-center">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'chapters', label: 'Chapters', icon: BookOpen },
          { id: 'progress', label: 'Progress', icon: BarChart3 },
          { id: 'study-hours', label: 'Hours', icon: CalendarDays },
          { id: 'pomodoro', label: 'Timer', icon: Timer },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer flex flex-col items-center gap-1 p-1.5 rounded-lg text-[11px] font-medium transition-colors ${isActive ? 'text-[#FB7185]' : 'text-[#64748B]'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* MAIN VIEWPORT                              */}
      {/* ========================================== */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 overflow-y-auto">

        {/* TOP HEADER WITH BANGLADESH CLOCK */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#FDA4AF] via-[#FB7185] to-[#F97316] bg-clip-text text-transparent">
              HSC 2026 — PCM Study Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 font-medium">
              Study consistently. Track honestly. Finish strong.
            </p>
          </div>
          <DhakaClock />
        </div>

        {/* ========================================== */}
        {/* VIEW 1: DASHBOARD                          */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            <QuoteCard categoryFilter={null} />

            {/* TOP METRICS SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl">
                <span className="text-xs font-medium text-[#64748B] block mb-1">HSC Progress</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {metrics.totalDone}<span className="text-xs text-[#64748B] font-normal">/50</span>
                  </span>
                  <span className="text-xs font-bold text-[#FB7185]">{metrics.overallHscPercent}%</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl">
                <span className="text-xs font-medium text-[#64748B] block mb-1">Admission Readiness</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {metrics.totalAdmission}<span className="text-xs text-[#64748B] font-normal">/50</span>
                  </span>
                  <span className="text-xs font-bold text-[#34D399]">{metrics.overallAdmissionPercent}%</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl">
                <span className="text-xs font-medium text-[#64748B] block mb-1">Needs Revision</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {metrics.totalNeedsRevision}
                  </span>
                  <span className="text-xs font-semibold text-[#F59E0B]">Action Needed</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl">
                <span className="text-xs font-medium text-[#64748B] block mb-1">MCQ Practiced</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {metrics.totalMcq}<span className="text-xs text-[#64748B] font-normal">/50</span>
                  </span>
                  <span className="text-xs font-semibold text-[#94A3B8]">{Math.round((metrics.totalMcq / 50) * 100)}%</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-[#64748B] block mb-1">CQ Practiced</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                    {metrics.totalCq}<span className="text-xs text-[#64748B] font-normal">/50</span>
                  </span>
                  <span className="text-xs font-semibold text-[#94A3B8]">{Math.round((metrics.totalCq / 50) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* SUBJECT PROGRESS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Object.entries(SUBJECTS).map(([key, sub]) => {
                const subData = metrics.subjects[sub.name];
                const hscPct = Math.round((subData.done / sub.totalChapters) * 100);
                const admPct = Math.round((subData.admission / sub.totalChapters) * 100);

                return (
                  <div
                    key={key}
                    className="bg-[#111827] border border-[#1F2937] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="w-full h-1 absolute top-0 left-0" style={{ backgroundColor: sub.color }} />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <h2 className="font-bold text-lg text-[#F8FAFC]">{sub.name}</h2>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1F2937] text-[#94A3B8]">
                          {sub.totalChapters} Ch
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#94A3B8]">HSC Syllabus Completion</span>
                            <span className="font-bold text-[#F8FAFC]">{subData.done} / {sub.totalChapters} ({hscPct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#1F2937] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${hscPct}%`, backgroundColor: sub.color }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#94A3B8]">Admission Readiness</span>
                            <span className="font-bold text-[#F8FAFC]">{subData.admission} / {sub.totalChapters} ({admPct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#1F2937] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 opacity-80"
                              style={{ width: `${admPct}%`, backgroundColor: sub.color }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1F2937] flex justify-between text-xs text-[#64748B]">
                      <span>MCQ: <strong className="text-[#F8FAFC]">{subData.mcq}</strong></span>
                      <span>CQ: <strong className="text-[#F8FAFC]">{subData.cq}</strong></span>
                      <span>Revision: <strong className="text-[#F59E0B]">{subData.revisionNeeded}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DASHBOARD CHARTS PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <SvgDonutChart
                title="HSC 2026 — Chapter Completion"
                completedTotal={metrics.totalDone}
                totalChapters={50}
                data={[
                  { name: 'Physics', count: metrics.subjects.Physics.done, max: 20, color: SUBJECTS.PHYSICS.color },
                  { name: 'Chemistry', count: metrics.subjects.Chemistry.done, max: 10, color: SUBJECTS.CHEMISTRY.color },
                  { name: 'Higher Math', count: metrics.subjects['Higher Mathematics'].done, max: 20, color: SUBJECTS.HIGHER_MATH.color }
                ]}
              />

              <SvgDonutChart
                title="HSC 2026 — Admission Readiness"
                completedTotal={metrics.totalAdmission}
                totalChapters={50}
                data={[
                  { name: 'Physics', count: metrics.subjects.Physics.admission, max: 20, color: SUBJECTS.PHYSICS.color },
                  { name: 'Chemistry', count: metrics.subjects.Chemistry.admission, max: 10, color: SUBJECTS.CHEMISTRY.color },
                  { name: 'Higher Math', count: metrics.subjects['Higher Mathematics'].admission, max: 20, color: SUBJECTS.HIGHER_MATH.color }
                ]}
              />
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 2: CHAPTER TRACKER                    */}
        {/* ========================================== */}
        {activeTab === 'chapters' && (
          <div className="space-y-6">

            {/* CONTROL PANEL */}
            <div className="bg-[#111827] border border-[#1F2937] p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search chapter in Bangla, English or chapter number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-sm text-[#F8FAFC] pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#64748B] hover:text-[#F8FAFC]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end text-xs text-[#94A3B8]">
                  <span>Showing: <strong className="text-[#F8FAFC]">{filteredChapters.length}</strong> / 50 Chapters</span>
                </div>
              </div>

              {/* FILTER SELECTORS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1F2937]">
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1 uppercase tracking-wider">Subject</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-xs text-[#F8FAFC] px-3 py-2 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  >
                    <option value="All">All Subjects (Physics, Chem, Math)</option>
                    <option value="Physics">Physics Only</option>
                    <option value="Chemistry">Chemistry Only</option>
                    <option value="Higher Mathematics">Higher Mathematics Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1 uppercase tracking-wider">Paper</label>
                  <select
                    value={paperFilter}
                    onChange={(e) => setPaperFilter(e.target.value)}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-xs text-[#F8FAFC] px-3 py-2 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  >
                    <option value="All">Both Papers (1st & 2nd)</option>
                    <option value="1st">1st Paper Only</option>
                    <option value="2nd">2nd Paper Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-xs text-[#F8FAFC] px-3 py-2 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Done">Completed (Done)</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Admission Ready">Admission Ready</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CHAPTER CARDS */}
            <div className="space-y-3">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-12 bg-[#111827] border border-[#1F2937] rounded-2xl">
                  <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-[#F8FAFC]">No matching chapters found</p>
                  <p className="text-xs text-[#64748B] mt-1">Try resetting your filter or search query</p>
                </div>
              ) : (
                filteredChapters.map(ch => {
                  const state = trackerData[ch.id] || INITIAL_CHAPTER_STATE;
                  const needsRevision = state.done && !state.revisionNotNeeded;
                  const subColor = SUBJECTS[ch.subject === 'Higher Mathematics' ? 'HIGHER_MATH' : ch.subject.toUpperCase()]?.color || '#FB7185';
                  const isNotesOpen = expandedNotes[ch.id];

                  return (
                    <div
                      key={ch.id}
                      className={`bg-[#111827] border rounded-2xl p-4 sm:p-5 transition-all ${needsRevision ? 'border-[#F59E0B]/50' : 'border-[#1F2937]'
                        }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        {/* Chapter Information */}
                        <div className="flex items-start gap-3">
                          <span
                            className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5"
                            style={{ backgroundColor: `${subColor}15`, color: subColor, border: `1px solid ${subColor}30` }}
                          >
                            Ch {ch.num}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-[#F8FAFC]">{ch.titleBn}</h3>
                              <span className="text-xs text-[#64748B]">({ch.titleEn})</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#94A3B8]">
                              <span style={{ color: subColor }} className="font-semibold">{ch.subject}</span>
                              <span>•</span>
                              <span>{ch.paper} Paper</span>

                              {needsRevision && (
                                <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Needs Revision
                                </span>
                              )}
                              {state.admissionReady && (
                                <span className="bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Admission Ready
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tracker Controls */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1F2937]">

                          <label className="flex items-center gap-2 cursor-pointer bg-[#0D1320] px-3 py-1.5 rounded-xl border border-[#1F2937] hover:border-[#FB7185]/50">
                            <input
                              type="checkbox"
                              checked={state.done}
                              onChange={() => toggleCheckbox(ch.id, 'done')}
                              className="w-4 h-4 rounded accent-[#FB7185]"
                            />
                            <span className="text-xs font-medium text-[#F8FAFC]">Done</span>
                          </label>

                          <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border transition-colors ${state.done ? 'bg-[#0D1320] border-[#1F2937]' : 'bg-[#0D1320]/50 border-[#1F2937] opacity-40 cursor-not-allowed'
                            }`}>
                            <input
                              type="checkbox"
                              disabled={!state.done}
                              checked={state.revisionNotNeeded}
                              onChange={() => toggleCheckbox(ch.id, 'revisionNotNeeded')}
                              className="w-4 h-4 rounded accent-[#34D399]"
                            />
                            <span className="text-xs font-medium text-[#F8FAFC]">No Rev</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer bg-[#0D1320] px-3 py-1.5 rounded-xl border border-[#1F2937]">
                            <input
                              type="checkbox"
                              checked={state.mcqDone}
                              onChange={() => toggleCheckbox(ch.id, 'mcqDone')}
                              className="w-4 h-4 rounded accent-[#A78BFA]"
                            />
                            <span className="text-xs font-medium text-[#94A3B8]">MCQ</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer bg-[#0D1320] px-3 py-1.5 rounded-xl border border-[#1F2937]">
                            <input
                              type="checkbox"
                              checked={state.cqDone}
                              onChange={() => toggleCheckbox(ch.id, 'cqDone')}
                              className="w-4 h-4 rounded accent-[#A78BFA]"
                            />
                            <span className="text-xs font-medium text-[#94A3B8]">CQ</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer bg-[#0D1320] px-3 py-1.5 rounded-xl border border-[#1F2937]">
                            <input
                              type="checkbox"
                              checked={state.admissionReady}
                              onChange={() => toggleCheckbox(ch.id, 'admissionReady')}
                              className="w-4 h-4 rounded accent-[#34D399]"
                            />
                            <span className="text-xs font-medium text-[#34D399]">Admission</span>
                          </label>

                          <button
                            onClick={() => setExpandedNotes(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${state.notes
                                ? 'bg-[#FB7185]/10 border-[#FB7185]/30 text-[#FB7185]'
                                : 'bg-[#0D1320] border-[#1F2937] text-[#64748B] hover:text-[#F8FAFC]'
                              }`}
                            title="Study Notes"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                        </div>
                      </div>

                      {/* Notes Drawer */}
                      {isNotesOpen && (
                        <div className="mt-4 pt-3 border-t border-[#1F2937]">
                          <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                            Personal Study Notes & Formula Drawer
                          </label>
                          <textarea
                            rows={2}
                            value={state.notes || ''}
                            onChange={(e) => handleNoteChange(ch.id, e.target.value)}
                            placeholder="Write important formulas, weak areas, or key problems here..."
                            className="w-full bg-[#0D1320] border border-[#1F2937] text-xs text-[#F8FAFC] p-3 rounded-xl focus:outline-none focus:border-[#FB7185]"
                          />
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 3: PROGRESS & CHARTS                  */}
        {/* ========================================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SvgDonutChart
                title="HSC 2026 — Chapter Completion"
                completedTotal={metrics.totalDone}
                totalChapters={50}
                data={[
                  { name: 'Physics', count: metrics.subjects.Physics.done, max: 20, color: SUBJECTS.PHYSICS.color },
                  { name: 'Chemistry', count: metrics.subjects.Chemistry.done, max: 10, color: SUBJECTS.CHEMISTRY.color },
                  { name: 'Higher Math', count: metrics.subjects['Higher Mathematics'].done, max: 20, color: SUBJECTS.HIGHER_MATH.color }
                ]}
              />

              <SvgDonutChart
                title="HSC 2026 — Admission Readiness"
                completedTotal={metrics.totalAdmission}
                totalChapters={50}
                data={[
                  { name: 'Physics', count: metrics.subjects.Physics.admission, max: 20, color: SUBJECTS.PHYSICS.color },
                  { name: 'Chemistry', count: metrics.subjects.Chemistry.admission, max: 10, color: SUBJECTS.CHEMISTRY.color },
                  { name: 'Higher Math', count: metrics.subjects['Higher Mathematics'].admission, max: 20, color: SUBJECTS.HIGHER_MATH.color }
                ]}
              />
            </div>

            {/* DETAILED METRICS TABLE */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="font-bold text-lg text-[#F8FAFC] mb-4">Subject-wise Performance Breakdown</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#94A3B8]">
                  <thead className="bg-[#0D1320] text-[#64748B] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Subject</th>
                      <th className="p-3">HSC Completion</th>
                      <th className="p-3">Admission Ready</th>
                      <th className="p-3">MCQ Practice</th>
                      <th className="p-3">CQ Practice</th>
                      <th className="p-3 rounded-r-xl">Needs Revision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {Object.entries(SUBJECTS).map(([key, sub]) => {
                      const data = metrics.subjects[sub.name];
                      return (
                        <tr key={key} className="hover:bg-[#0D1320]/50 transition-colors">
                          <td className="p-3 font-bold text-[#F8FAFC] flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                            {sub.name}
                          </td>
                          <td className="p-3 text-[#F8FAFC] font-semibold">{data.done} / {sub.totalChapters}</td>
                          <td className="p-3 text-[#34D399] font-semibold">{data.admission} / {sub.totalChapters}</td>
                          <td className="p-3 text-[#F8FAFC]">{data.mcq} / {sub.totalChapters}</td>
                          <td className="p-3 text-[#F8FAFC]">{data.cq} / {sub.totalChapters}</td>
                          <td className="p-3 text-[#F59E0B] font-bold">{data.revisionNeeded}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'study-hours' && (
          <DailyStudyHours
            studyData={dailyStudyData}
            onSetStudyDuration={(dateKey, milliseconds) => studyTimeEditor(dateKey, milliseconds)}
            dailyGoalMinutes={dailyGoalMinutes}
            onSetDailyGoalMinutes={setDailyGoalMinutes}
            studyGoalHours={studyGoalHours}
            onSetStudyGoalHours={setStudyGoalHours}
            todayKey={todayKey}
          />
        )}

        <div className={activeTab === 'pomodoro' ? 'block' : 'hidden'}>
          <StudyTimer
            canTrackToday={todayKey >= STUDY_START_DATE && todayKey < EXAM_DATE}
            todayKey={todayKey}
            settings={pomodoroSettings}
            onStudyDataChange={handleStudyDataChange}
            onRegisterManualEdit={handleStudyTimeEditorReady}
            onRegisterReset={handleStudyClockResetReady}
            onRegisterDataRestore={handleStudyDataRestoreReady}
          />
        </div>

        {/* ========================================== */}
        {/* VIEW 5: SETTINGS & BACKUP                  */}
        {/* ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto">

            <QuoteCard categoryFilter={null} />

            {/* TIMER CONFIGURATION */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="font-bold text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-[#FB7185]" />
                Pomodoro Timer Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="focus-duration" className="text-xs text-[#94A3B8] block mb-1">Focus Duration (minutes)</label>
                  <input
                    id="focus-duration"
                    type="number"
                    min="1"
                    max="120"
                    value={pomodoroSettings.focusTime}
                    onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, focusTime: parseInt(e.target.value) || 25 })}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-sm text-[#F8FAFC] p-2.5 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  />
                </div>

                <div>
                  <label htmlFor="short-break-duration" className="text-xs text-[#94A3B8] block mb-1">Short Break (minutes)</label>
                  <input
                    id="short-break-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={pomodoroSettings.shortBreakTime}
                    onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, shortBreakTime: parseInt(e.target.value) || 5 })}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-sm text-[#F8FAFC] p-2.5 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  />
                </div>

                <div>
                  <label htmlFor="long-break-duration" className="text-xs text-[#94A3B8] block mb-1">Long Break (minutes)</label>
                  <input
                    id="long-break-duration"
                    type="number"
                    min="1"
                    max="90"
                    value={pomodoroSettings.longBreakTime}
                    onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, longBreakTime: parseInt(e.target.value) || 15 })}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-sm text-[#F8FAFC] p-2.5 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  />
                </div>

                <div>
                  <label htmlFor="long-break-interval" className="text-xs text-[#94A3B8] block mb-1">Long Break Interval (sessions)</label>
                  <input
                    id="long-break-interval"
                    type="number"
                    min="1"
                    max="10"
                    value={pomodoroSettings.longBreakInterval}
                    onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, longBreakInterval: parseInt(e.target.value) || 4 })}
                    className="w-full bg-[#0D1320] border border-[#1F2937] text-sm text-[#F8FAFC] p-2.5 rounded-xl focus:outline-none focus:border-[#FB7185]"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1F2937] flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Sound Chime Notifications</span>
                <button
                  onClick={() => setPomodoroSettings({ ...pomodoroSettings, soundEnabled: !pomodoroSettings.soundEnabled })}
                  className={`p-2 rounded-xl border cursor-pointer ${pomodoroSettings.soundEnabled ? 'bg-[#FB7185]/10 border-[#FB7185]/30 text-[#FB7185]' : 'bg-[#0D1320] border-[#1F2937] text-[#64748B]'
                    }`}
                >
                  {pomodoroSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* BACKUP & RESTORE */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="font-bold text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#34D399]" />
                Backup & Data Synchronization
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExportData}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0D1320] border border-[#1F2937] hover:border-[#34D399] text-sm font-semibold text-[#F8FAFC] transition-colors"
                >
                  <Download className="w-4 h-4 text-[#34D399]" />
                  <span>Export Progress JSON</span>
                </button>

                <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0D1320] border border-[#1F2937] hover:border-[#FB7185] text-sm font-semibold text-[#F8FAFC] cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#FB7185]" />
                  <span>Import Progress JSON</span>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
              </div>

              {/* RESET SECTION */}
              <div className="mt-6 pt-6 border-t border-[#1F2937]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#EF4444]">Reset All Study Progress</h4>
                    <p className="text-xs text-[#64748B]">Wipe all checkboxes and notes stored in local storage.</p>
                  </div>
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="cursor-pointer px-4 py-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all text-xs font-bold"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* CONFIRMATION MODAL */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

    </div>
  );
}