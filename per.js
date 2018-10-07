const _ = require('lodash');
const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const {isMarketingSenderWord} = require('./marketing');
const freqWordsNoPersonPath = path.join(__dirname,'./data/freq_words_no_person.json');
const strJson = fs.readFileSync(freqWordsNoPersonPath, 'utf8');	
const freqWordsNoPerson = JSON.parse(strJson);

const ExpectedIsAutomated = {
  UNKOWN : -10000,
  PERSON : -2,
  NOT_AUTOMATED: -1,
  NOT_SURE: 0,
  AUTOMATED: 1,
  MARKETING: 2,
}

function isNonPerson(normWord) {
	return freqWordsNoPerson[normWord] !== undefined;
}

function splitNonAlpha(str) {
  const alName = str.replace(/[^a-z']/ig,' ').toLocaleLowerCase();	//filter out non-alpha chars (exept ' - ex: O'Donnal)
  let words = alName.split(' ');	
  return words;
}

//SubStr match of domain to name toks.
function getSubStrMatchDomainToks(words, setDomainToks, startsOrEnds, matchDomainTokSubStr, setFilterWords ) {
  if (words.length === 0) { return matchDomainTokSubStr; }
  //* domainTok startsWith or endsWith one of the nameToks
  const wordsPat = words.sort((a,b)=>b.length - a.length).map((word)=>startsOrEnds ? ('^'+word) : (word + '$')).join('|');    
  const re = new RegExp(`${wordsPat}`,'ig');
  const MIN_DOMAIN_TOK_MATCH_LEN = 3;    
  for (const domTok of setDomainToks) {
    const arrMatches = domTok.match(re);
    for (const match of (arrMatches || [])) {
      //Minimal match len >= 3 --> avoid  incorrectly matching 'al' from Al Bandi' to 'elal','com' 
      if (match.length >= MIN_DOMAIN_TOK_MATCH_LEN) { 
        setFilterWords.add(match);
        //Each domainTok can be matched by startsWith ^ token and endsWith $ nameTok 
        //* Since this function is called 2 times, for ^ and for $, We do not want to count twice exact matches
        //* We also do not want to match 2 nameToks (dek, ekel) which together are longer than the domainTok (dekel)
        const domTokPrevMtLen = matchDomainTokSubStr.domToksMt[domTok];
        if (domTokPrevMtLen === undefined || (domTokPrevMtLen + match.length <= domTok.length) )  {
          matchDomainTokSubStr.numNameToks += 1;
          matchDomainTokSubStr.totalMatchLen += match.length;
          //If 2 nameToks exactly cover a domainTok --> strong indication of a nonPerson sender (Ex: Apple Music <new@applemusic.com>)
          if (domTokPrevMtLen + match.length === domTok.length) {
            matchDomainTokSubStr.coveredDomainTok += 1;
          }
        } else if (match.length > domTokPrevMtLen) { 
          //If 2 nameToks match the same domainTok and their total length is longer than the domainTok --> update totalMatchLen
          //to reflect longest match
          matchDomainTokSubStr.totalMatchLen += match.length - domTokPrevMtLen;
        }

        matchDomainTokSubStr.domToksMt[domTok] = (domTokPrevMtLen === undefined) ? match.length : domTokPrevMtLen + match.length;
        
      } //If Min match len
    } //End for arrMatches                    
  } //End for setDomainToks
    
  return matchDomainTokSubStr;
}

function parseNameTok(name,setDomainToks,filterInfo) {
  if (!name) { return []; }  
  let words = splitNonAlpha(name);
  filterInfo.nameToks = [...new Set([...words, ...filterInfo.nameToks])];
  words = words.filter((word)=>word.length >= 2);		  //filter out too short words

  const setFilterWords = new Set();
  for (const word of words) { 	//filter out words appearing in email domain (company name) ex: filter out 'harmon.ie' when ex: 'David from harmon.ie'	  
    if (setDomainToks.has(word)) {
      setFilterWords.add(word);
      filterInfo.matchDomainTok = 1;
    }  	
  }; 
    
  getSubStrMatchDomainToks(words, setDomainToks, true,filterInfo.matchDomainTokSubStr,setFilterWords );
  getSubStrMatchDomainToks(words, setDomainToks, false, filterInfo.matchDomainTokSubStr,setFilterWords );

  words = words.filter((word)=>{ 
    const matchMarketingSenderWord = isMarketingSenderWord(word);
    filterInfo.matchMarketingSenderWord |= matchMarketingSenderWord;
    return !matchMarketingSenderWord; 
  });

  words = words.filter((word)=>{ 
  	const matchNonPersonTok = isNonPerson(word);
  	filterInfo.matchNonPersonTok |= matchNonPersonTok;
  	return !matchNonPersonTok; 
  }); //filter out 'from' - common eng words that cannot be person name ex: 'David from harmon.ie'
    
  words = words.filter((word)=>!setFilterWords.has(word)); //Filter domain (exact and substr matches) words at the end, allowing marketing and nonPerson flags to also hit. 
  return words;

}
function parseMailTokens(mailInfo) {  
  const email = mailInfo && (mailInfo.email || mailInfo.mail || mailInfo.emailAddress);
  if (!email) {
  	return [];
  }
  const [ userMail, domainMail ] = email.toLocaleLowerCase().split('@');
  //* Split email domain tokens 'user@harmon.ie' --> ['harmon','ie']
  const domainToks = domainMail && splitNonAlpha(domainMail) || [];  
  const filterInfo = { nameToks: [], matchDomainTok: 0,matchMarketingSenderWord: 0, matchNonPersonTok: 0, domainToks, matchDomainTokSubStr: {numNameToks: 0, totalMatchLen: 0, coveredDomainTok: 0, domToksMt : {}}  };
  const setDomainToks = new Set(domainToks);
  const userMailToks = parseNameTok(userMail, setDomainToks, filterInfo);
  const [ dispNameClean, dummyDomain ] = mailInfo.displayName && mailInfo.displayName.toLocaleLowerCase().split('@') || '';
  const dispNameToks = parseNameTok(dispNameClean, setDomainToks, filterInfo);
  let arrNameTok = [...new Set([...userMailToks, ...dispNameToks])]; //Remove duplicates  
  return { arrNameTok, mailInfo, filterInfo };
}


module.exports = {
   parseMailTokens,    
   ExpectedIsAutomated,
   isNonPerson,
}