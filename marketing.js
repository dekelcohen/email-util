const _ = require('lodash');

//TODO: marketing link, long/utm_campain/click./go. captioned link + sender matches domainToks ...
function getMarketingMailScore(update) {
	let score = 0;
	const bodySpecialWords = getInitSpecialBodyWords();
  	getSpecialBodyWords(update.body, bodySpecialWords);
  	if (bodySpecialWords.all > 0) {
  		score += 1;
  	}

  	const urlStats = getInitUrlStats();  	
  	getUrlStats(update.body,urlStats);
  	if (urlStats.captionedCount >= 2) {
  		score += 1;
  	}
  	return score;
}


function isMarketingMail(update) {    
  return getMarketingMailScore(update) >= 2;
}

const marketingSenderWordsRE = /marketing|reply$|webinar|notification|notify|communication|event|newsletter|shipping|updates|solutions|partners|subscriptions|analytics|connections|messaging|service|customer|experience$|^from$|^at$|survery|feedback/;
 
 //includes e-mail,do-not-reply because of splitNonAlpha
//Counts marketing words in name and domain (ex: reply@e-mail.microsoft.com)
function isMarketingSenderWord(maybeNameTok) {    
   return maybeNameTok.match(marketingSenderWordsRE) != null;      
}

function getInitSpecialBodyWords() {
 return { all: 0, unsubscribe: 0, noWishReceive:0, register : 0, viewInBrowser: 0 }
}

function getSpecialBodyWords(text, words) {
	if (!text) { return words; }
	if (text.match(/\bunsubscribe\b/i) != null) {
		words.unsubscribe += 1;
		words.all += 1;
	} else if (text.match(/(no|don't){1,10}wish{1,10}receive/i) != null) {
		words.noWishReceive += 1; //31 emails that do not have \bunsubscribe\b (796) isFocused = true
		words.all += 1;
	}

	if (text.match(/\bregister\b/i) != null) {
		words.register += 1; //Only 477 emails out of 14562 (isFocused = true).
		words.all += 1;
	}

	if (text.match(/view.{1,40}(email|browser|web|page)/i) != null) {
		words.viewInBrowser += 1; //Only 97 emails out of 14562 (isFocused = true). Appears in ~1600 isFocused = false
		words.all += 1;
	}
	return words;
}

function getSpecialSubjectWords(text, words) {
	if (!text) { return words; }
	if (text.match(/webinar/i) != null) {
		words.webinar += 1;
		words.all += 1;
	}
	if (text.match(/\bregister\b/i) != null) {
		words.register += 1;
		words.all += 1;
	}
	
	return words;
}

function getInitUrlStats() {
	return { captionedCount : 0, captionedLen: 0 };
}
//Count the number and total length of all captioned Urls: Url Caption Text<http[s]://>
//It turns out that generated/marketing emails are much more likely to have a captioned url compared to manual email and these urls are 
//pretty damn long (and also seem different). 
function getUrlStats(text,urlStats) {
	if (!text) { return count; }
	const urlRe = /<http[s]{0,1}:\/\/.*>/g;
	 while ((m = urlRe.exec(text)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === urlRe.lastIndex) {
            urlRe.lastIndex++;
        }
        urlStats.captionedCount += 1;
        urlStats.captionedLen += m[0].length;                
    } // End while scan text for urls
	return urlStats;
}


module.exports = {
   isMarketingSenderWord,
   getSpecialBodyWords,
   getInitSpecialBodyWords,
   getSpecialSubjectWords, 
   getUrlStats,
   getInitUrlStats,
   isMarketingMail,
}