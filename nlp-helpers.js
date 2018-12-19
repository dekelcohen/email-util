const fs = require('fs-extra');
const _ = require('lodash');
const shallowequal = require('shallowequal');

const SPACE_CHARS = ' \u00A0\u200B\u3000';
const BASE_LANG_CHARS = 'a-zA-Z';

const EUROPEAN_LANG_CHARS = '@a-zÀ-ÖØ-öø-ž';
const VALID_CHARACTERS_MIDDLE = "_'-.&\u2019'ʼ՚＇";
const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9';
const VALID_TERM_PAT = `^[${EUROPEAN_LANG_CHARS}][${EUROPEAN_LANG_CHARS}${VALID_CHARACTERS_MIDDLE}${VALID_DIGITS}]{0,30}$`;

const VALID_PUNCTUATION = '-x\u2010-\u2015\u2212\u30FC\uFF0D-\uFF0F\u00AD\u2060' + SPACE_CHARS +
                '()\uFF08\uFF09\uFF3B\uFF3D.\\[\\]/~\u2053\u223C\uFF5E';

const DIGITS_PAT = `[${VALID_DIGITS}]+`;
const DIGITS_RE = new RegExp(`${DIGITS_PAT}`,'gi')
const BASE_LANG_PAT = `[${BASE_LANG_CHARS}]+`;
const BASE_LANG_RE = new RegExp(`${BASE_LANG_PAT}`,'g')
const PUNCTUATION_PAT = `[${VALID_PUNCTUATION}]+`;
const PUNCTUATION_RE = new RegExp(`${PUNCTUATION_PAT}`,'g')


function getNormalizedSubject(subject) {
	return subject.replace(/^fw:|^re:|^fwd:|^aw:/gi, '').replace(/^Accepted:|^Cancelled:|^Declined:/g, '').trim();
}

function normEmailAddr(emailAddr) { 
	return emailAddr.trim().toLocaleLowerCase();
}

async function readJsonFile(filePath) {
	const strJson = await fs.readFile(filePath, 'utf8');
	return JSON.parse(strJson);
}

async function writeJsonFile(filePath, objJson) {
	const content = JSON.stringify(objJson);    
    await fs.writeFile(filePath, content, 'utf8');	
}

function* chunkArray(arr,chunkSize=1) {
	for (let i=0; i < arr.length; i+=chunkSize) {
    	const chunk = arr.slice(i,i+chunkSize);    
    	yield chunk;
    }
};

//Array equality with shallow-equality operator (compare array of objects with keys, but not nested keys)
function isArrayEq(arrL, arrR, { omitKeys = [] } = {}) {
  let arrLeft = arrL;
  let arrRight = arrR;
  if (!_.isEmpty(omitKeys)) {
    arrLeft = arrLeft.map((item)=>_.omit(item,omitKeys))
    arrRight = arrRight.map((item)=>_.omit(item,omitKeys))
  }
  return _(arrLeft).differenceWith(arrRight, shallowequal).isEmpty();
};

function regExpEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&"); //Do not escape \s
}

function findTopicInText(topicText,text) {
    let escapedTopicText = regExpEscape(topicText);
    if (escapedTopicText.indexOf(' ') != - 1) {
        escapedTopicText = escapedTopicText.replace(/ /g,'( {1,2}|%20)');
    }
    escapedTopicText = '(?<!\\w)' + escapedTopicText + '(?!\\w)'; 
    // The (?<!\w) is a negative lookbehind that fails the match 
    // if there is a word char immediately to the left of the current location.
    // (?!\w) is a negative lookahead that fails the match if,
    // immediately to the right of the current location, there is a word char
    // (for some reason, \b doesn't behave as expected when the topic ends or starts with 
    // a question mark)
    // See https://stackoverflow.com/a/52213075/813665
    const m = new RegExp(escapedTopicText).exec(text);     
    let res = null;
    if (m != null) {
       res = { idxStart : m.index, matchStr : m[0], text };
    }
    return res;
}


//Transform Object to Array (similar to lodash _.values, but with optional key in the resulting array of objects )
//Ex: obj = { sharepoint: { count : 2 }, office: { count : 3}} --> objToArr(obj,'topicId') --> [{ topicId: 'sharepoint', count : 2}, { topicId: 'office', count : 3}]
function objToArr(obj,keyPropName) {
  return Object.entries(obj).map(([key, value]) => { 
    const elm = {...value}; 
    if (keyPropName) {
      elm[keyPropName] = key; 
    }    
    return elm;
  });
}


module.exports = {
   getNormalizedSubject,
   normEmailAddr,
   readJsonFile,
   writeJsonFile,
   chunkArray,
   regExpEscape,
   findTopicInText,
   isArrayEq,
   objToArr,
   SPACE_CHARS,
   VALID_DIGITS,
   VALID_PUNCTUATION,   
   PUNCTUATION_PAT,
   VALID_TERM_PAT,
   BASE_LANG_CHARS,
   BASE_LANG_PAT,
   DIGITS_PAT,
   DIGITS_RE,
   BASE_LANG_RE,
   PUNCTUATION_RE,
}
