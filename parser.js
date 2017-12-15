const fs = require('fs')

const loadStopWords = stopListFileName => {
    const stopWords = 
        fs.readFileSync(stopListFileName, 'utf-8')
        .split('\r\n')
        .map(w => w.trim().toLowerCase())
    return new Set(stopWords)
}

const cleanSrt = srt => {
    return srt
        .replace(/\d*\r\n[\d,:]* --> [\d,:]*/g, '') // remove timeline
        .replace(/\r\n-/g, '\r\n') // remove "-" at the beginning of the line 
        .replace(/[♪"]/g, '') // remove garbage
        .replace(/<\/?[a-z][a-z0-9]*[^<>]*>|<!--.*?-->/img, '') // remove html tags 
        .replace(/\r\n/g, ' ') // new line
        .replace(/\s{2,}/g, ' ') // 2 and more spaces to one
        .replace(/\.{1,}|[!?]{1,}/g, m => `${m}\n`) // new line after ! or ? or . or ...
        .split('\n') // split again... 
        .map(line => line.trim()) // to trim each line
        .join('\n') // finally join
}

const findWords = (text, stopWords) => {
    const wordsRegExp = /\b[a-z]+(?:['-]?[a-z]+)*\b/ig
    
    const words = new Set()
    let searchResult
    while((searchResult = wordsRegExp.exec(text)) !== null) {
        let word = searchResult[0].toLowerCase()
        if (!stopWords.has(word)) {
            if (endsWith(word, '\'s')) {
                uu2(word, '\'s')
            } else if (endsWith(word, '\'ve')) {
                uu2(word, '\'ve')
            } else if (endsWith(word, '\'ll')) {
                uu2(word, '\'ll')
            } else if (endsWith(word, '\'d')) {
                uu2(word, '\'d')
            } else if (endsWith(word, 's')) {
                uu(word, 's')
            } else if (endsWith(word, 'ing')) {
                uu(word, 'ing')
            } else if (endsWith(word, 'ed')) {
                uu(word, 'ed')
            } else if (endsWith(word, 'es')) {
                uu(word, 'es')
            } else {
                words.add(word.toLowerCase())
            }
        }
    }

    function endsWith(word, suffix) {
        return word.slice(word.length - suffix.length) === suffix
    }

    function uu(word, suffix) {
        let word_n = word.slice(0, word.length-suffix.length)
        if (!stopWords.has(word_n)) {
            words.add(word.toLowerCase())
        }
    }

    function uu2(word, suffix) {
        let word_n = word.slice(0, word.length-suffix.length)
        if (!stopWords.has(word_n)) {
            words.add(word_n.toLowerCase())
        }
    }

    return Array.from(words)
}

const parse = (srt, stopListFileName) => {
    const text = cleanSrt(srt)
    const sentences = text.split('\n')
    const stopWords = loadStopWords(stopListFileName)
    const words = findWords(text, stopWords)
    
    const matches = words.map(w => ({
        word: w,
        sentences: sentences.filter(s => {
            const pattern = `\\b${w}\\b`
            return s.search(new RegExp(pattern, 'i')) != -1
        })
    }))

    return {
        text,
        sentences,
        words,
        matches
    }
}

module.exports = parse
