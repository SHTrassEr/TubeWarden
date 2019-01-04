import * as snowballStemmer from "snowball-stemmer.jsx/dest/russian-stemmer.common.js";

const stemmer = new snowballStemmer.RussianStemmer();
const spaceRegExp = new RegExp(/[\u200B-\u200D\uFEFF]/g);

export function getWordList(s: string): string[] {
    return s.toLowerCase().split(/[“”—\@\/\*\]\[\{\}\)\(\?\!\#\:'" ,«»\.\|-]+/)
        .map((w) => w.replace(spaceRegExp, ""))
        .filter((w) => w && w.length > 2);
}

export function stemWordList(wordList: string[]): string[] {
    return stemmer.stemWords(wordList).filter((w) => w && w.length > 2);
}

export function stemWord(word: string): string {
    const stemmedWord = stemmer.stemWord(word);
    if (stemmedWord.length > 2) {
        return stemmedWord;
    }

    return word;
}

export default function stemString(s: string): string[] {
    const wordList = getWordList(s);
    return stemmer.stemWords(wordList).filter((w) => w && w.length > 2);
}
