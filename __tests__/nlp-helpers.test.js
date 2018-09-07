const { findTopicInText } = require('../nlp-helpers.js');

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