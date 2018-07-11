const SPACE_CHARS = ' \u00A0\u200B\u3000';
const VALID_DIGITS = '0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9';
const VALID_PUNCTUATION = '-x\u2010-\u2015\u2212\u30FC\uFF0D-\uFF0F\u00AD\u2060' + SPACE_CHARS +
  						  '()\uFF08\uFF09\uFF3B\uFF3D.\\[\\]/~\u2053\u223C\uFF5E';


const DIGITS_PAT = `[${VALID_DIGITS}]+`;
const DIGITS_RE = new RegExp(`${DIGITS_PAT}`,'gi')

const SEPARATOR_PAT = `[${VALID_PUNCTUATION}]{1,4}`;
const SEPARATOR_RE = new RegExp(`(${SEPARATOR_PAT})`,'gi');


const MAYBE_PHONE_NUMBER_RE = new RegExp(`${DIGITS_PAT}((${SEPARATOR_PAT})*${DIGITS_PAT})*`,'gi');

const MAX_TOTAL_DIGITS = 15;
const MAX_GROUP_DIGITS = 15;
const MIN_TOTAL_DIGITS = 6;

function validPhoneNumber(candidate) {
	let valid = true;
	const arrGrps = candidate.split(SEPARATOR_RE);
	//* Require first group to be digits, second seps, third digits (alternating, starting and ending with digits)
	// This catches too long separators (>4 spaces ...)
	let gType = true; //true is digits, false is separators 
	let totalDigits = 0;
	let digitsGroups = 0;
	for (const grp of arrGrps) {
		//* Digits group
		if (gType) { 
			if (!grp.match(DIGITS_RE)) {
				valid = false;
				break;
			}
			if (grp.length > MAX_GROUP_DIGITS) {
				valid = false;
				break;
			}
			totalDigits += grp.length;
			digitsGroups += 1;
		} else {
			//Separators validation - if a punctuation (hyphen, dot, other than space is duplicated - not valid)
			const sorted_grp = grp.split('').sort();
			for (var i = 0; i < sorted_grp.length - 1; i++) {
			    if (sorted_grp[i + 1] == sorted_grp[i]) {
			        if (SPACE_CHARS.indexOf(sorted_grp[i]) === -1) {
			        	valid = false;
						break;
			        }
			    }
			}
		}
		gType = !gType;


	} //End for 

	if (totalDigits < MIN_TOTAL_DIGITS || totalDigits > MAX_TOTAL_DIGITS || digitsGroups > 6) {
		valid = false;				
	}

	return valid;
}

function extractPhoneNumbers(text) {    
    const curRe = new RegExp(
        MAYBE_PHONE_NUMBER_RE,
        'g',
    );
    let m;
    const phoneNumbers = [];
    while ((m = curRe.exec(text)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === curRe.lastIndex) {
            curRe.lastIndex++;
        }

        m.forEach((match, index, groupIndex) => {
            if (match && validPhoneNumber(match)) {
            	//console.log(match);
            	phoneNumbers.push(match);
            }
        });
    } // End while scan text with re
    return phoneNumbers;
}


module.exports = {
   extractPhoneNumbers,    
}