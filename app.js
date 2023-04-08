var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var cybersourceRestApi = require('cybersource-rest-client');

// common parameters
const AuthenticationType = 'http_signature';
const RunEnvironment = 'cybersource.environment.SANDBOX';
const MerchantId = 'aptmarch2023';

// http_signature parameters
const MerchantKeyId = '24889401-6084-4a4a-a6c1-977e87adedb6';
const MerchantSecretKey = process.env.RestSecret ;

// jwt parameters
const KeysDirectory = 'Resource';
const KeyFileName = 'testrest';
const KeyAlias = 'testrest';
const KeyPass = 'testrest';

// logging parameters
const EnableLog = true;
const LogFileName = 'cybs';
const LogDirectory = '../log';
const LogfileMaxSize = '5242880'; //10 MB In Bytes


var configObj = {
	'authenticationType': AuthenticationType,	
	'runEnvironment': RunEnvironment,

	'merchantID': MerchantId,
	'merchantKeyId': MerchantKeyId,
	'merchantsecretKey': MerchantSecretKey,
    
	'keyAlias': KeyAlias,
	'keyPass': KeyPass,
	'keyFileName': KeyFileName,
	'keysDirectory': KeysDirectory,
    
	'enableLog': EnableLog,
	'logFilename': LogFileName,
	'logDirectory': LogDirectory,
	'logFileMaxSize': LogfileMaxSize
};


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);






app.get('/Unified',function(req,res){
console.log("Attempting Capture Context");

try{

  /**
   * 
   *  Setting Capture Context Request
   * 
   */


    var options = {
      "targetOrigins" : [ "https://apt-unifiedcheckout-test.glitch.me" ],
      "clientVersion" : "0.15",
      "allowedCardNetworks" : [ "VISA", "MASTERCARD", "AMEX" ],
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


 
// Requesting Capture Context


  console.log('Importing SDK');
  const CC= require('./RequestCaptureContext.js');
  CC.requestCaptureContext(JSON.stringify(options),function (error, data, response, statusCode) {
		// capture context sucessfully generated
	
    res.render('unified',{title: data,CaptureContext: data});
  }, false);
  

  


}catch (error) {
 res.send('Error : ' + error + 'Error status code : ' + error.statusCode);
}

});


/**
 * 
 *   This Page is to display the capture Transient token response from Unified Payments
 */

app.post('/tokenUnified', function (req, res) {

  try {
         
          console.log('Response : ' + req.body.transientToken);

          res.render('tokenUnified', { transientToken:  req.body.transientToken} );
                  
  } catch (error) {
          res.send('Error : ' + error + ' Error status code : ' + error.statusCode);
  }


});




app.post('/receiptUnified', function (req, res) {

  var tokenResponse = req.body.transientToken;
  console.log('Transient token for payment is: ' + tokenResponse);

   try {
          
          var instance = new cybersourceRestApi.PaymentsApi(configObj);

          var clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
          clientReferenceInformation.code = 'test_flex_payment';

          var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
          processingInformation.commerceIndicator = 'internet';

          var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
          amountDetails.totalAmount = '102.21';
          amountDetails.currency = 'USD';

          var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
          billTo.country = 'US';
          billTo.firstName = 'John';
          billTo.lastName = 'Deo';
          billTo.phoneNumber = '4158880000';
          billTo.address1 = 'test';
          billTo.postalCode = '94105';
          billTo.locality = 'San Francisco';
          billTo.administrativeArea = 'MI';
          billTo.email = 'test@cybs.com';
          billTo.address2 = 'Address 2';
          billTo.district = 'MI';
          billTo.buildingNumber = '123';

          var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
          orderInformation.amountDetails = amountDetails;
          orderInformation.billTo = billTo;

          // EVERYTHING ABOVE IS JUST NORMAL PAYMENT INFORMATION
          // THIS IS WHERE YOU PLUG IN THE MICROFORM TRANSIENT TOKEN
          var tokenInformation = new cybersourceRestApi.Ptsv2paymentsTokenInformation();
          tokenInformation.transientTokenJwt = tokenResponse;

          var request = new cybersourceRestApi.CreatePaymentRequest();
          request.clientReferenceInformation = clientReferenceInformation;
          request.processingInformation = processingInformation;
          request.orderInformation = orderInformation;
          request.tokenInformation = tokenInformation;

          console.log('\n*************** Process Payment ********************* ');

          instance.createPayment(request, function (error, data, response) {
              if (error) {
                  console.log('\nError in process a payment : ' + JSON.stringify(error));
              }
              else if (data) {
                  console.log('\nData of process a payment : ' + JSON.stringify(data));
                  res.render('receiptUnified', { paymentResponse:  JSON.stringify(data)} );
          
              }
              console.log('\nResponse of process a payment : ' + JSON.stringify(response));
              console.log('\nResponse Code of process a payment : ' + JSON.stringify(response['status']));
              callback(error, data);
          });
          
      } catch (error) {
          console.log(error);
      }

});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
