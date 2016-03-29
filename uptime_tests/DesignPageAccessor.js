var https = require('https');

var DesignPageAccessor = function(successCallback, configParams){

    var HOST = "https://app.octoblu.com:443";
    var HTTP_RESPONSE_OK = "200";

    this.accessDesignerPage = function () {
        var options = {
            host: 'email-password.octoblu.com',
            path: '/sessions',
            method: 'POST',
            headers: {'Content-Type':'application/json'}
        };

        var postFields = {
            email:configParams.octobluUser,
            password:configParams.octobluPass,
            callbackUrl: HOST + "/api/session?callbackUrl=%2Fdesign"
        };

        var callback = function(response) {
            var urlWithToken = response.headers.location;
            console.log("location: "+ response.headers.location +", status code: "+ response.statusCode);
            signInWithToken(urlWithToken);
        }.bind(this);

        var postRequest = https.request(options, callback)
            .on('error', function (e) {
                console.log("Error: " + e.message);
                //we fail to cancel failure timeout; no need to do anything else
            });
        postRequest.write(JSON.stringify(postFields));
        postRequest.end();
    };

    var extractCookieValue = function(cookieName, cookies) {
        if(!cookieName || !cookies || !cookieName.length || !cookies.length) {
            return "";
        }
        for(var i = 0; i < cookies.length; i++) {
            if(cookies[i].substr(0, cookieName.length) === cookieName) {
                return cookies[i].replace(cookieName+"=", "").replace("; Path=/", "");
            }
        }
        return "";
    };

    var signInWithToken = function(landingPageURl) {
        https.get(landingPageURl, function(response) {
            var designUrl = response.headers.location;
            var cookies = response.headers['set-cookie'];
            var uuid = extractCookieValue("meshblu_auth_uuid", cookies);
            var token = extractCookieValue("meshblu_auth_token", cookies);
            if (designUrl === "/design") {
                redirectToDesignPage(designUrl, uuid, token)
            } else {
                signOut(uuid, token);
            }
        }).on('error', function (e) {
            console.log("Error: " + e.message);
            //we fail to cancel failure timeout; no need to do anything else
        });
    };

    var redirectToDesignPage = function (designUrl, uuid, token) {
        https.get(HOST + designUrl, function(response) {
            console.log("location: "+ response.headers.location +", status code: "+ response.statusCode);
            if (response.statusCode == HTTP_RESPONSE_OK){
                successCallback();
            }
            signOut(uuid, token);
        }).on('error', function(e) {
            console.log("Error: " + e.message);
            signOut(uuid, token);
        })
    };

    var signOut = function(uuid, token) {
        console.log("signing out w/ uuid = " + uuid + "and token = " + token);
        var headers = {
            meshblu_auth_uuid: uuid,
            meshblu_auth_token: token
        };

        var options = {
            host: 'app.octoblu.com',
            path: '/api/auth',
            method: 'DELETE',
            headers: headers
        };

        var callback = function(response) {
            console.log("Sign-out status code: " + response.statusCode);
        }.bind(this);

        var deleteRequest = https.request(options, callback)
            .on('error', function (e) {
                console.log("Error: " + e.message);
            });
        deleteRequest.write('');
        deleteRequest.end();
    };
};

module.exports = DesignPageAccessor;