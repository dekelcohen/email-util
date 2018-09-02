const fs = require('fs-extra');
const _ = require('lodash');
const shallowequal = require('shallowequal');

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
    escapedTopicText = '\\b'+escapedTopicText+'\\b';    
    const m = new RegExp(`${escapedTopicText}`).exec(text);     
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
}
