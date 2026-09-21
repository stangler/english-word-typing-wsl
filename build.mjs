import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

function convertWords(data, defaultLesson = '') {
  // Part列（Introduction / 1 / 2 / 3 / Goal Activity など）が出現する順番を
  // シート内での初出順に記録しておく。defaultLessonが指定されていない
  // （＝小学校・曜日などの語彙集ではなく、Lesson1〜3のような通常レッスン）場合のみ、
  // このPart順にもとづいてサブレッスン（例: 2-1, 2-2, 2-3）に分割する。
  const partOrder = [];
  data.forEach(row => {
    if (!row['英語'] || row['英語'].trim() === '') return;
    const part = String(row['Part'] || row['カテゴリー'] || '');
    if (part && !partOrder.includes(part)) partOrder.push(part);
  });

  return data.filter(row => row['英語'] && row['英語'].trim() !== '').map(row => {
    let lesson = defaultLesson ? defaultLesson : (row['Lesson'] || '');
    const part = String(row['Part'] || row['カテゴリー'] || '');

    // Lesson 1・2・3 などの通常レッスンをPartの出現順でサブレッスンに分割
    // 例: Lesson1 → 1-1, 1-2, 1-3, 1-4 / Lesson2 → 2-1, 2-2, 2-3
    if (!defaultLesson && lesson !== '' && partOrder.length > 1) {
      const idx = partOrder.indexOf(part);
      if (idx !== -1) {
        lesson = `${lesson}-${idx + 1}`;
      }
    }

    return {
      lesson: lesson,
      part: part,
      en: row['英語'] || '',
      answer: (row['英語'] || '').replace(/〜.*$/, ''),  // Remove 〜 and anything after for answer
      ipa: row['発音'] || '',
      pos: row['品詞'] || '',
      ja: row['意味'] || row['日本語'] || '',
      ex_en: row['英語例文'] || '',
      ex_ja: row['日本語訳'] || '',
      memo: row['なんでもメモ'] || '',
    };
  });
}

// --- Process all csv files in csv/ directory ---
let allWords = [];

if (!fs.existsSync('csv')) {
  console.error('Error: csv/ directory not found.');
  process.exit(1);
}

const csvFiles = fs.readdirSync('csv').filter(f => f.endsWith('.csv'));

if (csvFiles.length === 0) {
  console.error('Error: No csv files found in csv/ directory.');
  process.exit(1);
}

csvFiles.forEach(filename => {
  const filepath = path.join('csv', filename);
  // BOM付きUTF-8で保存されたExcel由来CSVにも対応
  const raw = fs.readFileSync(filepath, 'utf-8').replace(/^\uFEFF/, '');
  const data = parse(raw, {
    columns: true,
    skip_empty_lines: true,
  });

  let words;
  if (filename.startsWith('小学校') || filename.startsWith('elementary')) {
    words = convertWords(data, 'elementary');
  } else {
    words = convertWords(data);
  }

  allWords = [...allWords, ...words];
  console.log(`  ✓ ${filename}: ${words.length} words`);
});

// Write combined JSON to json/ folder
if (!fs.existsSync('json')) fs.mkdirSync('json');
fs.writeFileSync('json/words.json', JSON.stringify(allWords, null, 2));
console.log(`Generated json/words.json with ${allWords.length} total words`);

// Write words-data.js to json/ folder (for direct file:// opening without server)
const jsContent = `window.WORDS = ${JSON.stringify(allWords, null, 2)};`;
fs.writeFileSync('json/words-data.js', jsContent);
console.log(`Generated json/words-data.js with ${allWords.length} total words`);

// Also write individual lesson JSONs to json/ folder
const lessons = {};
allWords.forEach(w => {
  const key = String(w.lesson);
  if (!lessons[key]) lessons[key] = [];
  lessons[key].push(w);
});

for (const [key, wordsList] of Object.entries(lessons)) {
  let filename;
  if (key === 'elementary') {
    filename = 'lesson-elementary.json';
} else if (key.startsWith('1-')) {
    // Handle split lessons like 1-1, 1-2, 1-3, 1-4
    filename = `lesson${key}.json`;
  } else {
    filename = `lesson${key}.json`;
  }
  fs.writeFileSync(`json/${filename}`, JSON.stringify(wordsList, null, 2));
  console.log(`Generated json/${filename} with ${wordsList.length} words`);
}
