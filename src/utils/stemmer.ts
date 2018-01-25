import * as snowballStemmer from "snowball-stemmer.jsx/dest/russian-stemmer.common.js";

const stemmer = new snowballStemmer.RussianStemmer();

function getWordList(s: string) {
    return s.toLowerCase().split(/[“”—\@\/\*\]\[\{\}\)\(\?\!\#\:'" ,«»\.\|-]+/);
}

export default function stemString(s: string): string[] {
    const wordList = getWordList(s);
    return stemmer.stemWords(wordList).filter((w) => w && w.length > 2);
}
