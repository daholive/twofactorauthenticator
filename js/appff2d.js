/* global QRCode otplib*/
(function() {
  var secret = '';
  var timing;
 console.log('iniciou');
  otplib.authenticator.options = {
    // 0 identifica o token atual;
    // 1 para o token futuro (pego através do app google authenticator);
    // -1 para o token anterior
    window: 1,
    step: 30 // tempo de duração do Token gerado
  };

  function toggleTabs(evt) {
    document.querySelectorAll('.tab-item').forEach(function(tab) {
      tab.classList.remove('is-active');
    });

    var clicked = evt.target || evt.srcElement;
    var parent = clicked.parentElement;
    parent.classList.add('is-active');

    var tabClass = parent.getAttribute('data-tab-id');
    document.querySelectorAll('.tab-item.' + tabClass).forEach(function(tab) {
      tab.classList.add('is-active');
    });
  }

  function createSecret() {
    // método para gerar automaticamente as chaves
    secret = otplib.authenticator.generateSecret();

    startCountdown();
    // otplib.authenticator.keyuri(@user, @service, @secret);
    // @user - id cliente configurado no Google APIs
    // @service - nome do serviço configurado no Google APIs
    // @secret - chave gerada para a aplicação criada no Google APIs
    //
    // após receber a chave, o método keyuri gera uma URL com o protocolo otpauth
    // para assim gerar um novo QR CODE
    var otpauth = otplib.authenticator.keyuri('demo', 'otplib', secret);

    document.querySelector('.otp-secret').innerHTML = secret;

    // lib QRcode utilizada para criar e exibir a imagem do QR Code gerado
    QRCode.toDataURL(otpauth, function(err, url) {
      var container = document.querySelector('.otp-qrcode .qrcode');
      if (err) {
        container.innerHTML = 'Error generating QR Code';
        return;
      }
      container.innerHTML = '<img src="' + url + '" alt="" />';
    });
  }

  // seta o token gerado na tela
  function setToken(token) {
    document.querySelector('.otp-token').innerHTML = token;
  }

  // função para controlar o tempo de exibição do token na tela
  function generator() {
    if (!secret) {
      window.clearInterval(timing);
      return;
    }

    const remaining = otplib.authenticator.timeRemaining();
    if (otplib.authenticator.timeUsed() === 0) {
      // se o tempo do token expirar, é gerado um novo
      setToken(otplib.authenticator.generate(secret));
    }

    // time left
    document.querySelector('.otp-countdown').innerHTML = remaining + 's';
  }

  // função que contabiliza o tempo de vida do token
  function startCountdown() {
    window.setTimeout(() => {
      if (secret) {
        // se existir a chave é gerado um novo token
        setToken(otplib.authenticator.generate(secret));
      }
      timing = window.setInterval(generator, 1000);
    }, 2000);
  }

  // função que verifica e valida o token e a chave
  function initVerify() {
    document
      .querySelector('.otp-verify-send')
      .addEventListener('click', function() {
        var inputValue = document.querySelector('.otp-verify-input').value;

        // verifica o token fornecido em relação ao token gerado
        var delta = otplib.authenticator.checkDelta(inputValue, secret);

        var text = document.querySelector('.otp-verify-result .text');
        var icon = document.querySelector('.otp-verify-result .fa');

        var win = '<br /> (window: ' + delta + ')';

        if (Number.isInteger(delta)) {
          icon.classList.add('fa-check');
          icon.classList.remove('fa-times');
          text.innerHTML = 'Verified token' + win;
          return;
        }

        icon.classList.add('fa-times');
        icon.classList.remove('fa-check');
        text.innerHTML = 'Cannot verify token';
      });
  }

  window.addEventListener('load', function() {
    document.querySelectorAll('.tabs .tab-item').forEach(function(tab) {
      tab.addEventListener('click', toggleTabs);
    });

    createSecret();
    initVerify();
  });
})();
