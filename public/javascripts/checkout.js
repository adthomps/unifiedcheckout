var authForm = document.getElementById("authForm");
var transientToken = document.getElementById("transientToken");

var cc = document.getElementById("captureContext").value;
var showArgs = {
  containers: {
    paymentSelection: "#buttonPaymentListContainer"
  }
};
Accept(cc)
  .then(function(accept) {
    return accept.unifiedPayments();
  })
  .then(function(up) {
    return up.show(showArgs);
  })
  .then(function(tt) {
    transientToken.value = tt;
    authForm.submit();
  });
