import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
  SafeAreaView, TextInput, Animated, Dimensions, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const squidgeImg = { uri: 'https://raw.githubusercontent.com/harnessthespark/squish-sparkle/master/assets/squidge.png' };

// ─── DATA ────────────────────────────────────────────────────────
const puzzleWords = [
  { word: "GLITTER", hint: "Sparkly stuff for crafts" },
  { word: "SPARKLE", hint: "To shine brightly" },
  { word: "FLUFFY", hint: "Soft and cuddly" },
  { word: "CUDDLE", hint: "A warm, cosy hug" },
  { word: "SHIMMER", hint: "A soft, pretty glow" },
  { word: "GLOW", hint: "To shine softly" },
  { word: "COSY", hint: "Warm and comfortable" },
  { word: "SHINE", hint: "To be bright and glossy" },
  { word: "BEAUTY", hint: "Looking and feeling lovely" },
  { word: "CHARM", hint: "Something lovely and delightful" },
  { word: "SNUGGLE", hint: "To cuddle up close" },
];

const storyStarters = [
  "It was a cosy day when a tiny glittering envelope appeared on the windowsill...",
  "At the sleepover, something magical appeared in the garden...",
  "A mysterious pink door appeared that had never been there before. Behind it was...",
  "One sparkly morning, a wish could be granted. The decision was to...",
  "A map to the legendary Glitter Grotto was found...",
  "Everything had turned pink and sparkly overnight...",
  "The glitter jar spilled and something magical started to grow...",
  "A shooting star landed in the garden, and out stepped...",
];

const moods = [
  { key: 'happy', emoji: '\u{1F60A}', label: 'Happy', response: 'Yay! That makes me so happy too! \u{1F389}' },
  { key: 'calm', emoji: '\u{1F60C}', label: 'Calm', response: "That's so peaceful \u{1F338}" },
  { key: 'worried', emoji: '\u{1F61F}', label: 'Worried', response: "*big hug* I'm here for you \u{1F495}" },
  { key: 'sad', emoji: '\u{1F622}', label: 'Sad', response: "It's okay to feel this way \u{1F495}" },
  { key: 'angry', emoji: '\u{1F620}', label: 'Angry', response: "Those feelings are totally valid. I'm here \u{1F495}" },
  { key: 'tired', emoji: '\u{1F634}', label: 'Tired', response: 'Rest is so important. Try calm breathing? \u{1F4A4}' },
  { key: 'anxious', emoji: '\u{1F630}', label: 'Anxious', response: "Moment by moment, you've got this \u{1F308}" },
  { key: 'excited', emoji: '\u{1F929}', label: 'Excited', response: 'Ooh exciting! That energy is amazing! \u{2728}' },
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

// ─── DECORATIONS ──────────────────────────────────────────────────
const SPARKLE_CHARS = ['\u{2728}', '\u{2B50}', '\u{1F496}', '\u{1F31F}', '\u{1F4AB}', '\u{1F98B}', '\u{1F338}'];
const NUM_SPARKLES = 12;

function FloatingSparkles() {
  const sparkles = useRef(
    Array.from({ length: NUM_SPARKLES }, (_, i) => ({
      char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
      x: Math.random() * (width - 30),
      size: 10 + Math.random() * 14,
      duration: 4000 + Math.random() * 6000,
      delay: Math.random() * 5000,
      anim: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    sparkles.forEach(s => {
      const animate = () => {
        s.anim.setValue(0);
        s.opacity.setValue(0);
        Animated.sequence([
          Animated.delay(s.delay),
          Animated.parallel([
            Animated.timing(s.anim, { toValue: 1, duration: s.duration, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(s.opacity, { toValue: 0.6, duration: s.duration * 0.2, useNativeDriver: true }),
              Animated.timing(s.opacity, { toValue: 0.6, duration: s.duration * 0.5, useNativeDriver: true }),
              Animated.timing(s.opacity, { toValue: 0, duration: s.duration * 0.3, useNativeDriver: true }),
            ]),
          ]),
        ]).start(() => {
          s.x = Math.random() * (width - 30);
          s.delay = 0;
          animate();
        });
      };
      animate();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparkles.map((s, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            fontSize: s.size,
            opacity: s.opacity,
            transform: [{
              translateY: s.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [height + 20, -40],
              }),
            }, {
              rotate: s.anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          }}
        >
          {s.char}
        </Animated.Text>
      ))}
    </View>
  );
}

function GradientBg() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.35, backgroundColor: '#FFD1E8', opacity: 0.5 }} />
      <View style={{ position: 'absolute', top: height * 0.2, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFB6C1', opacity: 0.15 }} />
      <View style={{ position: 'absolute', top: height * 0.5, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: '#C9A0DC', opacity: 0.12 }} />
      <View style={{ position: 'absolute', bottom: 100, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFD700', opacity: 0.08 }} />
    </View>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ height: 2, width: 30, backgroundColor: '#FFB6C1', borderRadius: 1 }} />
        <Text style={st.secTitle}>{icon} {title}</Text>
        <View style={{ height: 2, width: 30, backgroundColor: '#FFB6C1', borderRadius: 1 }} />
      </View>
    </View>
  );
}

// ─── APP ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'squish-sparkle-app';

const defaultData = {
  userName: '',
  setupComplete: false,
};

export default function App() {
  const [ud, setUd] = useState(defaultData);
  const [screen, setScreen] = useState('loading');
  const [section, setSection] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [worryInput, setWorryInput] = useState('');
  const [storyInput, setStoryInput] = useState('');
  const [puzzle, setPuzzle] = useState(null);
  const [puzzleLetters, setPuzzleLetters] = useState([]);
  const [puzzleAnswer, setPuzzleAnswer] = useState([]);
  const [puzzleUsed, setPuzzleUsed] = useState([]);
  const [puzzleResult, setPuzzleResult] = useState('');
  const [storySt, setStorySt] = useState('');
  const [breathPhase, setBreathPhase] = useState('');
  const [breathCount, setBreathCount] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [worrySent, setWorrySent] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const d = await AsyncStorage.getItem(STORAGE_KEY);
      if (d) { const parsed = { ...defaultData, ...JSON.parse(d) }; setUd(parsed); }
    } catch (e) {}
    setScreen('main');
  };

  const save = async (newUd) => {
    setUd(newUd);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUd)); } catch (e) {}
  };

  const completeSetup = () => {
    if (!nameInput.trim()) return;
    const nu = { ...ud, userName: nameInput.trim(), setupComplete: true };
    save(nu);
  };

  const selectMood = (m) => {
    // Show response briefly then go back
    setTimeout(() => setSection(null), 1500);
  };

  const sendWorry = () => {
    if (!worryInput.trim()) return;
    setWorrySent(true);
    setWorryInput('');
  };

  const startBreathing = () => {
    if (breathing) return;
    setBreathing(true);
    setBreathCount(0);
    doBreath(0);
  };

  const doBreath = (count) => {
    if (count >= 4) {
      setBreathPhase('Well done! \u{1F338}');
      setBreathing(false);
      return;
    }
    setBreathPhase('Breathe in... \u{1F338}');
    setTimeout(() => setBreathPhase('Hold... \u{2728}'), 3000);
    setTimeout(() => setBreathPhase('Breathe out... \u{1F4A8}'), 5000);
    setTimeout(() => { setBreathCount(count + 1); doBreath(count + 1); }, 8000);
  };

  const loadNewPuzzle = () => {
    const p = pick(puzzleWords);
    setPuzzle(p);
    setPuzzleLetters(shuffle(p.word.split('')));
    setPuzzleAnswer([]);
    setPuzzleUsed([]);
    setPuzzleResult('');
  };

  const tapLetter = (letter, idx) => {
    if (puzzleUsed.includes(idx)) return;
    const newAns = [...puzzleAnswer, letter];
    setPuzzleAnswer(newAns);
    setPuzzleUsed([...puzzleUsed, idx]);
    if (newAns.length === puzzle.word.length) {
      if (newAns.join('') === puzzle.word) {
        setPuzzleResult('\u{1F389} Sparkling! You got it!');
      } else {
        setPuzzleResult('The word was ' + puzzle.word + '. Try again! \u{1F4AA}');
      }
    }
  };

  const loadNewStory = () => {
    setStorySt(pick(storyStarters));
    setStoryInput('');
  };

  const openSection = (name) => {
    setSection(name);
    setWorrySent(false);
    if (name === 'word') loadNewPuzzle();
    if (name === 'story') loadNewStory();
  };

  // ─── RENDER ────────────────────────────────────────────────────
  if (screen === 'loading') return <View style={st.bg}><Text style={st.loadTxt}>Loading...</Text></View>;

  // Setup screen
  if (!ud.setupComplete) {
    return (
      <SafeAreaView style={st.bg}>
        <StatusBar barStyle="dark-content" />
        <GradientBg />
        <FloatingSparkles />
        <View style={st.setupWrap}>
          <Image source={squidgeImg} style={st.squidgeImg} resizeMode="contain" />
          <Text style={st.setupTitle}>{'\u{1F338}'} My Cosy Corner {'\u{1F338}'}</Text>
          <Text style={st.setupSub}>What's your name?</Text>
          <TextInput style={st.setupInput} value={nameInput} onChangeText={setNameInput}
            placeholder="Your name..." placeholderTextColor="#cba" maxLength={15} />
          <TouchableOpacity style={st.pinkBtn} onPress={completeSetup}>
            <Text style={st.pinkBtnTxt}>Let's Go! {'\u{2728}'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (section) {
    let content = null;

    if (section === 'mood') {
      content = (
        <>
          <SectionHeader icon={'\u{1F308}'} title="How are you feeling?" />
          <View style={st.moodGrid}>
            {moods.map(m => (
              <TouchableOpacity key={m.key} style={st.moodBtn} onPress={() => selectMood(m)}>
                <Text style={{fontSize:28}}>{m.emoji}</Text>
                <Text style={st.moodLbl}>{m.label}</Text>
                <Text style={st.moodResp}>{m.response}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    } else if (section === 'worry') {
      content = worrySent ? (
        <View style={{alignItems:'center',padding:30}}>
          <Text style={{fontSize:50, marginBottom:12}}>{'\u{2601}\u{FE0F}'}</Text>
          <Text style={st.worryMsg}>Your worry is safe now.{'\n'}It's okay. You can let it go. {'\u{1F495}'}</Text>
          <TouchableOpacity style={st.pinkBtn} onPress={() => { setWorrySent(false); }}>
            <Text style={st.pinkBtnTxt}>Write Another</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <SectionHeader icon={'\u{2601}\u{FE0F}'} title="Worry Pillow" />
          <Text style={st.subTxt}>Write it down and let it go. This is your safe space.</Text>
          <TextInput style={st.textArea} value={worryInput} onChangeText={setWorryInput}
            placeholder="Let it all out... I'm listening..." placeholderTextColor="#B8A0C8"
            multiline textAlignVertical="top" />
          <TouchableOpacity style={st.purpleBtn} onPress={sendWorry}>
            <Text style={st.pinkBtnTxt}>{'\u{1F495}'} Let It Go</Text>
          </TouchableOpacity>
        </>
      );
    } else if (section === 'breathing') {
      content = (
        <>
          <SectionHeader icon={'\u{1F338}'} title="Calm Breathing" />
          <Text style={{fontSize:60,textAlign:'center',marginVertical:15}}>{'\u{1F338}'}</Text>
          <Text style={st.breathTxt}>{breathPhase || 'Ready when you are!'}</Text>
          <View style={st.breathDots}>
            {[0,1,2,3].map(i => <View key={i} style={[st.dot, breathCount > i && st.dotDone]} />)}
          </View>
          <TouchableOpacity style={st.pinkBtn} onPress={startBreathing} disabled={breathing}>
            <Text style={st.pinkBtnTxt}>{breathing ? 'Breathing...' : 'Start Breathing \u{1F338}'}</Text>
          </TouchableOpacity>
        </>
      );
    } else if (section === 'word') {
      content = puzzle ? (
        <>
          <SectionHeader icon={'\u{1F48E}'} title="Word Sparkle" />
          <View style={st.card}>
            <Text style={st.hintTxt}>Hint: {puzzle.hint}</Text>
            <View style={st.answerRow}>
              {puzzle.word.split('').map((_, i) => (
                <View key={i} style={st.ansSlot}>
                  <Text style={st.ansLetter}>{puzzleAnswer[i] || ''}</Text>
                </View>
              ))}
            </View>
            <View style={st.letterRow}>
              {puzzleLetters.map((l, i) => (
                <TouchableOpacity key={i} style={[st.letterTile, puzzleUsed.includes(i) && st.letterUsed]}
                  onPress={() => tapLetter(l, i)}>
                  <Text style={st.letterTxt}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {puzzleResult ? <Text style={st.resultTxt}>{puzzleResult}</Text> : null}
          </View>
          <TouchableOpacity style={st.purpleBtn} onPress={loadNewPuzzle}>
            <Text style={st.pinkBtnTxt}>New Word {'\u{1F48E}'}</Text>
          </TouchableOpacity>
        </>
      ) : null;
    } else if (section === 'story') {
      content = (
        <>
          <SectionHeader icon={'\u{1F4D6}'} title="Story Studio" />
          <View style={st.card}>
            <Text style={st.storyStart}>{storySt}</Text>
            <TextInput style={st.textArea} value={storyInput} onChangeText={setStoryInput}
              placeholder="Continue the story..." placeholderTextColor="#B8D4F0"
              multiline textAlignVertical="top" />
          </View>
          <TouchableOpacity style={st.purpleBtn} onPress={loadNewStory}>
            <Text style={st.pinkBtnTxt}>New Story {'\u{1F4D6}'}</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <SafeAreaView style={st.bg}>
        <StatusBar barStyle="dark-content" />
        <GradientBg />
        <FloatingSparkles />
        <ScrollView style={st.pad}>
          <TouchableOpacity style={st.backBtn} onPress={() => setSection(null)}>
            <Text style={st.backTxt}>{'\u{2190}'} Back</Text>
          </TouchableOpacity>
          {content}
          <View style={{height:40}}/>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── MAIN SCREEN ───────────────────────────────────────────────
  const name = ud.userName || 'You';
  const activities = [
    { icon: '\u{1F308}', label: 'How are you?', key: 'mood' },
    { icon: '\u{2601}\u{FE0F}', label: 'Worry Pillow', key: 'worry' },
    { icon: '\u{1F338}', label: 'Calm Breathing', key: 'breathing' },
    { icon: '\u{1F48E}', label: 'Word Sparkle', key: 'word' },
    { icon: '\u{1F4D6}', label: 'Story Studio', key: 'story' },
  ];

  return (
    <SafeAreaView style={st.bg}>
      <StatusBar barStyle="dark-content" />
      <GradientBg />
      <FloatingSparkles />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.pad}>
        <View style={st.greetWrap}>
          <Image source={squidgeImg} style={st.squidgeMain} resizeMode="contain" />
          <Text style={st.greetTxt}>Hi {name} {'\u{1F338}'}</Text>
          <Text style={st.hint}>Your cosy corner, always here for you</Text>
        </View>

        {/* Activities grid */}
        <View style={st.actGrid}>
          {activities.map(a => (
            <TouchableOpacity key={a.key} style={st.actCard} onPress={() => openSection(a.key)}>
              <View style={st.actIconWrap}>
                <Text style={st.actIcon}>{a.icon}</Text>
              </View>
              <Text style={st.actLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={st.footerWrap}>
          <Text style={st.footer}>Made with {'\u{1F495}'} for you{'\n'}Your data stays on your device</Text>
        </View>
        <View style={{height:30}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const st = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FFE4EC' },
  pad: { padding: 16 },
  loadTxt: { textAlign: 'center', marginTop: 100, color: '#8B4A6B', fontSize: 16 },

  setupWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  setupTitle: { fontSize: 26, fontWeight: 'bold', color: '#8B4A6B', marginBottom: 8 },
  setupSub: { fontSize: 15, color: '#B07A9E', marginTop: 8, marginBottom: 25 },
  setupInput: { width: '80%', padding: 14, borderWidth: 3, borderColor: '#FFB6C1', borderRadius: 15, fontSize: 16, textAlign: 'center', backgroundColor: 'white', color: '#8B4A6B' },

  squidgeImg: { width: 140, height: 120, marginBottom: 12 },
  squidgeMain: { width: 120, height: 100, marginBottom: 8 },
  greetWrap: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  greetTxt: { fontSize: 24, fontWeight: 'bold', color: '#8B4A6B' },
  hint: { textAlign: 'center', color: '#B8A0C8', fontSize: 13, marginTop: 6 },

  actGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  actCard: { width: '48%', backgroundColor: 'white', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  actIcon: { fontSize: 34, marginBottom: 6 },
  actLabel: { fontSize: 13, fontWeight: '600', color: '#8B4A6B' },
  actIconWrap: { backgroundColor: 'rgba(255,105,180,0.08)', borderRadius: 20, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },

  pinkBtn: { backgroundColor: '#FF69B4', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginTop: 14 },
  purpleBtn: { backgroundColor: '#9B59B6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginTop: 14 },
  pinkBtnTxt: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  backBtn: { marginBottom: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'white', borderRadius: 12, alignSelf: 'flex-start', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  backTxt: { color: '#8B4A6B', fontWeight: '600', fontSize: 14 },

  secTitle: { fontSize: 20, fontWeight: 'bold', color: '#8B4A6B', textAlign: 'center', marginBottom: 16 },
  subTxt: { textAlign: 'center', color: '#8B4A6B', marginBottom: 12, fontSize: 14 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  moodBtn: { backgroundColor: 'white', borderWidth: 2, borderColor: '#FFB6C1', borderRadius: 14, padding: 12, alignItems: 'center', minWidth: 70 },
  moodLbl: { fontSize: 11, color: '#8B4A6B', marginTop: 4 },
  moodResp: { fontSize: 9, color: '#B8A0C8', marginTop: 2, textAlign: 'center' },

  textArea: { borderWidth: 2, borderColor: '#C9A0DC', borderRadius: 14, padding: 14, fontSize: 15, backgroundColor: 'white', minHeight: 90 },
  worryMsg: { fontSize: 16, color: '#8B4A6B', textAlign: 'center', marginTop: 14, lineHeight: 24 },

  breathTxt: { fontSize: 22, fontWeight: 'bold', color: '#5B7DB1', textAlign: 'center', minHeight: 34 },
  breathDots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ccc' },
  dotDone: { backgroundColor: '#5B7DB1', transform: [{ scale: 1.2 }] },

  hintTxt: { textAlign: 'center', color: '#666', fontStyle: 'italic', marginBottom: 12 },
  answerRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 14 },
  ansSlot: { width: 32, height: 38, backgroundColor: '#f0f0f0', borderWidth: 2, borderColor: '#ccc', borderRadius: 8, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  ansLetter: { fontSize: 16, fontWeight: 'bold' },
  letterRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  letterTile: { width: 38, height: 38, backgroundColor: 'white', borderWidth: 2, borderColor: '#9B59B6', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  letterUsed: { opacity: 0.25 },
  letterTxt: { fontSize: 16, fontWeight: 'bold', color: '#9B59B6' },
  resultTxt: { textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: '#8B4A6B', marginTop: 12 },

  storyStart: { fontSize: 14, color: '#5D4E37', lineHeight: 22, fontStyle: 'italic', marginBottom: 12 },

  footer: { textAlign: 'center', color: '#8B4A6B', opacity: 0.6, fontSize: 12, lineHeight: 18 },
  footerWrap: { alignItems: 'center', marginTop: 20 },
});
