## ServiceNow Node package for using the table api

 - Requires that an OAuth entry be created for your application in ServiceNow

 ### Usage
 ```javascript
//Authenticate to ServiceNow to obtain an OAuth Token

var snAuth = new ServiceNowAuth('https://myinstance.service-now.com', '<OAUTH_Client_ID>', '<OAuth_Client_Secret>', '<ServiceNow_UserName>', '<ServiceNow_User_Password');

snAuth.auth()
    .then(token => {
        //success
    })
    .catch(error => {
        //error
    });


//Query ServiceNow
var client = new ServiceNowQuery('table_name', snAuth);
client
    .and('field', 'some_value')
    .execute()
    .then(result => {
        //query results
    })
    .catch(error => {
        //error
    });
 ```