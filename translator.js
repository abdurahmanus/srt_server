const translate = require('google-translate-api')

const parseRaw = raw => {
    const rawJson = JSON.parse(raw)
    const translation = rawJson[0][0][0]
    const alt = rawJson[1]
    let altTranslations = {}
    if (alt) {
        alt.forEach((arr => {
            altTranslations[arr[0]] = arr[1].filter(x => x !== translation).slice(0, 3)
        }))
    }
    return {
        altTranslations,
        transcription: rawJson[0][1][3]
    }
}

const translateWord = word =>
    translate(word, {from: 'en', to: 'ru', raw: true})
        .then(res => {
            const { altTranslations, transcription } = parseRaw(res.raw)
            return {
                word,
                translation: res.text,
                altTranslations,
                transcription
            }
        })

module.exports.translateWord = translateWord

