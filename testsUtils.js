

function onlyTests(testData) {
    // keep the tests with `only` flag set to true
    // or keep all the tests if no tests have the `only` flag set to true 
    const executedTestsData = testData.filter((tcData) => tcData.only);
    if (executedTestsData.length === 0) {
        return testData;
    }
    return executedTestsData;
}
function describeJsonData(suiteTitle, testData, testCaseCallback) {
    describe(suiteTitle, () => {
        let executedTestsData = onlyTests(testData);
        for (const tcData of executedTestsData) {
            const title = `test ${tcData.testName}`;
            if (tcData.skip) {
                it.skip(title, () => { });
            } else {
                it(title, () => testCaseCallback(tcData));
            }
        }
    });
}

module.exports = {
    describeJsonData
}