const { VALID_TERM_PAT, findTopicInText } = require('../nlp-helpers.js');

describe('valid term pattern', () => {
  const termRegex = new RegExp(VALID_TERM_PAT, "i");
  describe('valid terms', () => {
    test('only characters', () => {
      expect('skype-ɑlpha'.match(termRegex)).toBeTruthy();
    });
    test('start with characters and then numbers', () => {
      expect('skype234'.match(termRegex)).toBeTruthy();
    });
    test('start with characters and then numbers and then special allowed chars', () => {
      expect("aa3.com".match(termRegex)).toBeTruthy();
    });
    test('special dashes allowed in the middle', () => {
      expect("Hyper‑AvailableEnterprise".match(termRegex)).toBeTruthy();
    });
    test('LATIN SMALL LETTER ALPHA ', () => {
      expect("Notificɑtion".match(termRegex)).toBeTruthy();
    });
    test('slashes allowed in the middle', () => {
      expect("aa3/bb".match(termRegex)).toBeTruthy();
    });
    test('end with special character', () => {
      expect("aa'".match(termRegex)).toBeTruthy();
    });
    test('weird apostrophes', () => {
      expect("aa3'ʼ՚＇com".match(termRegex)).toBeTruthy();
    });
  });
  describe('invalid terms', () => {
    test('start with special characters', () => {
      expect('-skype'.match(termRegex)).toBeFalsy();
    });
    test('start with  numbers', () => {
      expect('23skype234'.match(termRegex)).toBeFalsy();
    });
    
    test('unallowed characters', () => {
      expect(",".match(termRegex)).toBeFalsy();
    });
    test('unallowed characters', () => {
      expect("ש".match(termRegex)).toBeFalsy();
    });
  });
});
describe('findTopicInText', () => {
  describe('unigram', () => {
    test('whole word regular characters', () => {
      expect(findTopicInText('IBM', 'IBM is great'))
        .toEqual({ "idxStart": 0, "matchStr": "IBM", "text": "IBM is great" });
    });
    test('regular characters after partial', () => {
      expect(findTopicInText('IBM', 'IBMis great'))
        .toBeNull();
    });
    test('regular characters before partial', () => {
      expect(findTopicInText('IBM', 'aaIBM great'))
        .toBeNull();
    });
    describe('suffixes', () => {
      test('special characters: !', () => {
        expect(findTopicInText('IBM!', 'IBM! is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM!", "text": "IBM! is great" });
      });
      test('special characters: *', () => {
        expect(findTopicInText('IBM*', 'IBM* is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM*", "text": "IBM* is great" });
      });
      test('special characters: ?', () => {
        expect(findTopicInText('IBM?', 'IBM? is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM?", "text": "IBM? is great" });
      });
    });
    describe('prefixes', () => {
      test('special characters: !', () => {
        expect(findTopicInText('!IBM', '!IBM is great'))
          .toEqual({ "idxStart": 0, "matchStr": "!IBM", "text": "!IBM is great" });
      });
      test('special characters: *', () => {
        expect(findTopicInText('*IBM', '*IBM is great'))
          .toEqual({ "idxStart": 0, "matchStr": "*IBM", "text": "*IBM is great" });
      });
      test('special characters: ?', () => {
        expect(findTopicInText('?IBM', '?IBM is great'))
          .toEqual({ "idxStart": 0, "matchStr": "?IBM", "text": "?IBM is great" });
      });
    });
  });

  describe('bigram', () => {
    test('whole word regular characters', () => {
      expect(findTopicInText('IBM Corp', 'IBM Corp is great'))
        .toEqual({ "idxStart": 0, "matchStr": "IBM Corp", "text": "IBM Corp is great" });
    });
    test('regular characters after partial', () => {
      expect(findTopicInText('IBM Corp', 'IBM Corpis great'))
        .toBeNull();
    });
    test('regular characters before partial', () => {
      expect(findTopicInText('IBM Corp', 'aaIBM Corp great'))
        .toBeNull();
    });
    describe('suffixes', () => {
      test('special characters: !', () => {
        expect(findTopicInText('IBM Corp!', 'IBM Corp! is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM Corp!", "text": "IBM Corp! is great" });
      });
      test('special characters: *', () => {
        expect(findTopicInText('IBM Corp*', 'IBM Corp* is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM Corp*", "text": "IBM Corp* is great" });
      });
      test('special characters: ?', () => {
        expect(findTopicInText('IBM Corp?', 'IBM Corp? is great'))
          .toEqual({ "idxStart": 0, "matchStr": "IBM Corp?", "text": "IBM Corp? is great" });
      });
    });
    describe('prefixes', () => {
      test('special characters: !', () => {
        expect(findTopicInText('!IBM Corp', '!IBM Corp is great'))
          .toEqual({ "idxStart": 0, "matchStr": "!IBM Corp", "text": "!IBM Corp is great" });
      });
      test('special characters: *', () => {
        expect(findTopicInText('*IBM Corp', '*IBM Corp is great'))
          .toEqual({ "idxStart": 0, "matchStr": "*IBM Corp", "text": "*IBM Corp is great" });
      });
      test('special characters: ?', () => {
        expect(findTopicInText('?IBM Corp', '?IBM Corp is great'))
          .toEqual({ "idxStart": 0, "matchStr": "?IBM Corp", "text": "?IBM Corp is great" });
      });
    });
  });
  test('bi-gram with 2 whitespaces', () => {
    expect(findTopicInText('IBM Corp', 'IBM  Corp is great'))
      .toEqual({ "idxStart": 0, "matchStr": "IBM  Corp", "text": "IBM  Corp is great" });
  });
  test('bi-gram with 3 whitespaces', () => {
    expect(findTopicInText('IBM Corp', 'IBM   Corp is great'))
      .toBeNull();
  });
})
