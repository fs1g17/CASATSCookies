(function () {
  var cookieForm = document.cookieForm;
  var responseInput = document.getElementById('response');
  var acceptAdditionalCookies = document.getElementById('cookie-consent-yes');
  var rejectAdditionalCookies = document.getElementById('cookie-consent-no');

  if (acceptAdditionalCookies) {
    acceptAdditionalCookies.onclick = function (e) {
      e.preventDefault();
      console.log('clicked YES');
      var cookieValue = {
        ga: true,
        preferenceSet: true,
        bannerActioned: true,
        //hideBannerShown: false
      }
      var cookieValueString = encodeURIComponent(JSON.stringify(cookieValue));
      document.cookie = `consentCookie=j%3A${cookieValueString};domain=;path=/`;

      responseInput.value = 'accept';
      cookieForm.submit();
    }
  }

  if (rejectAdditionalCookies) {
    rejectAdditionalCookies.onclick = function (e) {
      e.preventDefault();
      console.log('clicked NO');
      var cookieValue = {
        ga: false,
        preferenceSet: true,
        bannerActioned: true,
        //hideBannerShown: false
      }
      var cookieValueString = encodeURIComponent(JSON.stringify(cookieValue));
      document.cookie = `consentCookie=j%3A${cookieValueString};domain=;path=/`;

      responseInput.value = 'reject';
      cookieForm.submit();
    }
  }
})();