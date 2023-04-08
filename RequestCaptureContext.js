'use strict';

const superagent = require('superagent');
const crypto = require('crypto');
const { json } = require('express');
const { error } = require('console');
const { response } = require('./app');

var requestHost = 'apitest.cybersource.com';
var merchantId = 'aptmarch2023';
const merchantKeyId = '24889401-6084-4a4a-a6c1-977e87adedb6';
const merchantSecretKey = process.env.RestSecret ;




var captureContext = {
	"targetOrigins" : [ "https://apt-unifiedcheckout-test.glitch.me" ],
	"clientVersion" : "0.15",
	"allowedCardNetworks" : [ "VISA", "MASTERCARD", "AMEX"],
	"allowedPaymentTypes" : [ "PANENTRY", "SRC" ],
	"country" : "US",
	"locale" : "en_US",
	"captureMandate" : {
	  "billingType" : "FULL",
	  "requestEmail" : true,
	  "requestPhone" : true,
	  "requestShipping" : true,
	  "shipToCountries" : [ "US", "GB" ],
	  "showAcceptedNetworkIcons" : true
	},
	"orderInformation" : {
	  "amountDetails" : {
		"totalAmount" : "21.00",
		"currency" : "USD"
	  },
	  "billTo" : {
		"address1" : "277 Park Avenue",
		"address2" : "50th Floor",
		"address3" : "Desk NY-50110",
		"address4" : "address4",
		"administrativeArea" : "NY",
		"buildingNumber" : "buildingNumber",
		"country" : "US",
		"district" : "district",
		"locality" : "New York",
		"postalCode" : "10172",
		"company" : {
		  "name" : "Visa Inc",
		  "address1" : "900 Metro Center Blvd",
		  "address2" : "address2",
		  "address3" : "address3",
		  "address4" : "address4",
		  "administrativeArea" : "CA",
		  "buildingNumber" : "1",
		  "country" : "US",
		  "district" : "district",
		  "locality" : "Foster City",
		  "postalCode" : "94404"
		},
		"email" : "john.doe@visa.com",
		"firstName" : "John",
		"lastName" : "Doe",
		"middleName" : "F",
		"nameSuffix" : "Jr",
		"title" : "Mr",
		"phoneNumber" : "1234567890",
		"phoneType" : "phoneType"
	  },
	  "shipTo" : {
		"address1" : "CyberSource",
		"address2" : "Victoria House",
		"address3" : "15-17 Gloucester Street",
		"address4" : "string",
		"administrativeArea" : "CA",
		"buildingNumber" : "string",
		"country" : "GB",
		"district" : "string",
		"locality" : "Belfast",
		"postalCode" : "BT1 4LS",
		"firstName" : "Joe",
		"lastName" : "Soap"
	  }
	}
  };


var payload = JSON.stringify(captureContext);




function paramToString(param) {
	if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
}
		
function normalizeParams(params) {
	var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = paramToString(value);
        }
      }
    }
    return newParams;
}
		
function generateDigest(payload) {
	var buffer = Buffer.from(payload, 'utf8');
	
	const hash = crypto.createHash('sha256');
	
	hash.update(buffer);
	
	var digest = hash.digest('base64');
	
	return digest;
}
		
function getHttpSignature(resource, method, request) {
	var signatureHeader = "";
    var signatureValue = "";
	
	// KeyId is the key obtained from EBC
	signatureHeader += "keyid=\"" + merchantKeyId + "\"";
	
	// Algorithm should be always HmacSHA256 for http signature
	signatureHeader += ", algorithm=\"HmacSHA256\"";
	
	// Headers - list is choosen based on HTTP method. 
	// Digest is not required for GET Method
	if (method === "get") {
		var headersForGetMethod = "host date (request-target) v-c-merchant-id";
		signatureHeader += ", headers=\"" + headersForGetMethod + "\"";
	}
	else if (method === "post") {
		var headersForPostMethod = "host date (request-target) digest v-c-merchant-id";
		signatureHeader += ", headers=\"" + headersForPostMethod + "\"";
	}
	
	var signatureString = 'host: ' + requestHost;

	signatureString += '\ndate: ' + new Date(Date.now()).toUTCString();
	signatureString += '\n(request-target): ';

	if (method === "get") {
		var targetUrlForGet = "get " + resource;
		signatureString += targetUrlForGet + '\n';
	}
	else if (method === "post") {
		// Digest for POST call
		var digest = generateDigest(payload);

		var targetUrlForPost = "post " + resource;
		signatureString += targetUrlForPost + '\n';

		signatureString += 'digest: SHA-256=' + digest + '\n';
	}
	
	signatureString += 'v-c-merchant-id: ' + merchantId;
	
	var data = new Buffer(signatureString, 'utf8');
	
	// Decoding scecret key
	var key = new Buffer(merchantSecretKey, 'base64');
	
	signatureValue = crypto.createHmac('sha256', key)
									.update(data)
									.digest('base64');

	signatureHeader += ", signature=\"" + signatureValue + "\"";
	
	return signatureHeader;
}
		
function processPost(payload,callback) {
	var resource = "/up/v1/capture-contexts";
    var method = "post";
    var statusCode = -1;
	var url = 'https://' + requestHost + resource;
	
	var headerParams = {};
	var contentType = 'application/json; charset=utf-8';
    var acceptType = 'application/jwt';
	
	var request = superagent(method, url);
	
	var bodyParam = payload;
	
	var signature = getHttpSignature(resource, method, request);
	
	var date = new Date(Date.now()).toUTCString();
	
	var digest = generateDigest(payload);	
	digest = "SHA-256=" + digest;
	
	console.log("\n -- RequestURL --");
	console.log("\tURL : " + url);
	console.log("\n -- HTTP Headers --");
	console.log("\tContent-Type : "+ contentType);
	console.log("\tv-c-merchant-id : " + merchantId);
	console.log("\tDate : " + date);
	console.log("\tHost : " + requestHost);
	console.log("\tSignature : " + signature);
	console.log("\tDigest : " + digest);

	console.log("\n -- RequestBody --");
	console.log("\tbody : " + bodyParam);
	
	headerParams['digest'] = digest;
	headerParams['v-c-merchant-id'] = merchantId;
	headerParams['date'] = date;
	headerParams['host'] = requestHost;
	headerParams['signature'] = signature;
	headerParams['User-Agent'] = "Mozilla/5.0";
	//headerParams['Accept'] = acceptType;
	
	// Set header parameters
    request.set(normalizeParams(headerParams));
	
	// Set request timeout
    request.timeout(60000);
	
	request.type(contentType);
	
	request.send(bodyParam);
	
	request.accept(acceptType);
	request.buffer();
	
	request.end(function(error, response) {
		
		var data = response.body;



		if (data == null || (typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length)) {
		  // SuperAgent does not always produce a body; use the unparsed response as a fallback
		  data = response.text;
		}
		

		console.log("\n -- Response Message for POST call --");
		console.log("\tResponse Code : " + response['status']);
		console.log("\tv-c-correlation-id : " + response.headers['v-c-correlation-id']);
		console.log("\tcontent-type : " + response['Content-Type']);
		console.log("\tResponse Data :");
		console.log(data);
		
		var _status = -1;
		if (response['status'] >= 200 && response['status'] <= 299) {
			_status = 0;
		}
		



		callback(error, data, response, _status);
    });
	
	return request;
}









function requestCaptureContext(payload,callback) {
	// HTTP POST REQUEST    
	console.log('\n\nSample 1: POST call - CyberSource Payments API - HTTP POST Payment request');
	processPost(payload,function (error, data, response, statusCode) {
		if (statusCode == 0) {
			console.log("\nSTATUS : SUCCESS (HTTP Status = " + statusCode + ")");
			console.log("\nCapture Context:\n" + data);
			callback(error,data,response,statusCode);
		}
		else {
			console.log("\nSTATUS : ERROR (HTTP Status = " + statusCode + ")");
			callback(error,data,response,statusCode);
		}
	});
    return;
	
}

if (require.main === module) {
	requestCaptureContext(payload,function () {
		console.log('\nStandAlone Http Signature end.');
	}, false);
}
module.exports.requestCaptureContext = requestCaptureContext;