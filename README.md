# Introduction 
Email text analysis and metadata utilities / helper functions


## Usage 

### Node 

Install: npm install email-util

###
```js
// Extracts the name tokens from email address + email Display Name. filters out tokens that appear in domain (e.g. acme), are common marketing words (e.g. from) or common english non-person name words (e.g. sales)
// Used by email-signature detector to search for sender name tokens in email body. We need to avoid detecting email address tokens such as support or sales as incorrect person name tokens.
const per = require('email-util/per');
const { arrNameTok } = per.parseMailTokens( { email: 'davidl from Acme@acme.com', displayName: 'David Landen' } );
expect(arrNameTok).to.have.members(["davidl","david","landen"]);

```
### Browser 

TBD

##	API Reference

### parseMailTokens( mailInfo )
Extracts the name tokens from email address + email Display Name. filters out tokens that appear in domain (e.g. acme), are common marketing words (e.g. from) or common english non-person name words (e.g. sales).
 
returns - { arrNameTok - arr of probable person nanes tokens from display name and email address,  filterInfo: detailed info about tokens filter activated. filterInfo is a non-stable data object}. 

mailInfo - email address and display Name { email: 'davidl from Acme@acme.com', displayName: 'David Landen' } 

## License and Attribution

This package has a 5000 most common english words / lemmas created by https://www.wordfrequency.info
the Author Mark Davis permits usage of his list in Open Source Projects, as long as a clear attribution to the above website is presented.   