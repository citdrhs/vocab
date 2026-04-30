// mergedata.js — fetches lesson data from the API and merges into lesson_data
var API = "http://localhost:5000/api";

function mergeLocalData(callback) {
    fetch(API + "/lessons")
    .then(function(r) { return r.json(); })
    .then(function(apiLessons) {
        for (var lessonNum in apiLessons) {
            if (!lesson_data[lessonNum]) {
                lesson_data[lessonNum] = {
                    words: {},
                    rps: { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} }
                };
            }
            if (!lesson_data[lessonNum].rps) {
                lesson_data[lessonNum].rps = { roots: {}, prefixes: {}, suffixes: {}, words: {}, sentences: {} };
            }

            Object.assign(lesson_data[lessonNum].words, apiLessons[lessonNum].words || {});

            (apiLessons[lessonNum].deletedWords || []).forEach(function(w) {
                delete lesson_data[lessonNum].words[w];
            });

            var rps = apiLessons[lessonNum].rps || {};
            Object.assign(lesson_data[lessonNum].rps.roots,     rps.roots     || {});
            Object.assign(lesson_data[lessonNum].rps.prefixes,  rps.prefixes  || {});
            Object.assign(lesson_data[lessonNum].rps.suffixes,  rps.suffixes  || {});
            Object.assign(lesson_data[lessonNum].rps.words,     rps.words     || {});
            Object.assign(lesson_data[lessonNum].rps.sentences, rps.sentences || {});

            (apiLessons[lessonNum].deletedRPS || []).forEach(function(t) {
                delete lesson_data[lessonNum].rps.roots[t];
                delete lesson_data[lessonNum].rps.prefixes[t];
                delete lesson_data[lessonNum].rps.suffixes[t];
            });
        }
        if (callback) callback();
    })
    .catch(function() {
        console.warn("Could not reach server, using lessondata.js only.");
        if (callback) callback();
    });
}