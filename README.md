# Unified Checkout Sample

## Setup Instructions

1. Remix this repo.

2. Modify app.js & RequestCaptureContext.js with the CyberSource REST credentials created through [Business Center Portal](https://businesscentertest.cybersource.com/).

```javascript
const MerchantId = "YOUR MERCHANT ID";
const MerchantKeyId = "YOUR KEY ID (SHARED SECRET SERIAL NUMBER)";
```

3. Modify the env

```
RestSecret = 'YOUR REST SECERET KEY'

```

4. Modify app.js & RequestCaptureContext.js to update your Domian in Captire context

```javascript
"targetOrigins" : [ "YOUR DOMAIN" ],
```

5. Navigate to http://[Your Domain]]/unified to try the sample application

## Tips

[Unified Checkout documentation](https://developer.cybersource.com/docs/cybs/en-us/unified-checkout/developer/all/rest/unified-checkout/uc-intro.html)
