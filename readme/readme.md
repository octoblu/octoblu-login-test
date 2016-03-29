#Setup Instructions

## logging/config.json Setup

### notifyEmail
 This is the email address that notifications about failures will be sent from. We are using Nodemailer and the service is currently set to Gmail. If a non-Gmail email is preferred, the service specified in `Notification.js` must be changed. If a Gmail account is used, it may need to be configured to enable support for “less secure” apps.  More info about this can be found here: [http://nodemailer.com/using-gmail/](http://nodemailer.com/using-gmail/)
### emailPass
 This is the password for the `notifyEmail` account.
### toEmail
 This is the email address that notifications about failures will be sent to.
### flows
 This is an array of objects containing a `name` string and a `url` string. The name can be any string (each name should be unique). The `url` is the URL for an Octoblu trigger. E.g.
 
 ```
 "flows": [   
     {    
        "name": "Octoblu Old Flow",
        "url": "https://triggers.octoblu.com/flows/25a06ad8-07af-4a35-9bf0-2b0cce0d1cc2/triggers/96942160-2b4b-11e5-8d9c-ed014cd347f2" 
     },
      {     
        "name": "Octoblu Beta Flow",     
        "url": "https://triggers.octoblu.com/flows/fb859571-24ed-47db-988f-f5eac36c686b/triggers/f6374a10-72af-11e5-ab88-4990a95bcaa0"   
     }
  ]
 ```
 
### pingWaitTime
 This is the number of minutes waited between each test.
###timeOuts
 This is the number of test failures before an email notification is sent.
###timeOutSeconds
 The number of seconds to wait for a response before failing the test.
###octobluUser
 The username login for the Octoblu account
###octobluPass
 The password for the Octoblu account
 
## Flow Page Test
- The flow page test posts to an Octoblu trigger and then waits for an HTTP GET at `(the base URL of the server)/flowtest`.
- A test succeeds if the post to the trigger succeeds and the HTTP GET request is received within the timeout period specified in `config.json`.
- The results of each flow page test iteration are saved to `logging/FlowPageLog_(name of each flow).csv` files (one csv file for each flow specified in `config.json`)
- Each line of these .csv files contains the time stamp of when the test ended as well as the number of seconds the test took to complete or 0 if the test failed.
- Note that this test requires the app to be hosted (i.e. it will always fail if run from localhost)
- The Flow Page Test requires one or more Octoblu flows each with a Trigger node connected to an http GET node. The HTTP Post URL should match the `url` of one of the `flows` specified in `config.json`.
- The http GET node’s Url parameter should be set to `(the base URL of the server)/flowtest`, and should contain a `uuid` header with a value matching the UUID of the flow (this UUID can be found in the browser’s address bar while on the flow’s design page).
- Flow UUID from browser address bar example
    - ![Flow UUID From Address Bar Image](/address_bar_flow_uuid_example.png)
- Flow nodes example
    - ![Flow Nodes Image](/flow_example_for_flow_page_test.png)
- Trigger configuration example 
    - ![Trigger Configuration Image](/trigger_configuration_for_flow_page_test.png)
    - The HTTP POST url should be copied to a flow within `config.json`
- HTTP GET configuration example 
    - ![HTTP GET Node Configuration Image](/http_get_configuration_for_flow_page_test.png)
    - Under Url, replace **http://octoblu-env.elasticbeanstalk.com** with the base URL for your server
    - Make sure the value of the uuid Header matches the UUID of the flow.
    
## Design Page Test
- The design page test attempts to sign into the Octoblu account using `config.json`’s `octobluUser`/`octobluPass`, then it attempts to redirect to the design page, and then attempts to log out. A test succeeds if the sign-in and redirect succeed.
- The results of each test iteration are saved to `logging/DesignPageLog.csv`
- As with the FlowPageLog.csv files, each line of `DesignPageLog.csv` contains the time stamp of when the test ended as well as the number of seconds the test took to complete or 0 if the test failed.
- Note that this test should work even when the server is run on localhost.