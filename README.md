# Gerador e validador de chaves utilizando Google Authenticator #

O Google Authenticator gera códigos para a verificação em duas etapas no seu smartphone.

A verificação em duas etapas oferece maior segurança para a sua Conta do Google, exigindo uma segunda etapa de verificação durante o login. Além da senha, você também precisará de um código gerado pelo app Google Authenticator no smartphone.

Foi utilizado neste experimento a biblioteca javascript chamada otplib:

    https://yeojz.github.io/otplib/docs/index.html

### Por que usar a lib OTBLIB? ###
 - **é uma biblioteca JavaScript One Time Password (OTP)**
 - **é compatível com o Google Authenticator e inclui métodos adicionais para permitir que você trabalhe com o Google Authenticator.**
 - **é um pacote que pode ser instalado via NPM e usado com Node.js**

### Utilização via browser ###

Existe uma versão compilada para ser usada direta com o navegador. É necessário adicionar o seguinte script ao seu código:

    <script src="lib/otplib-browserff2d.js"></script>

Você pode encontrá-lo em node_modules/otplib depois de instalar.

Além desta lib OTBLIB foi implementado neste experimento o seguinte arquivo javascript:

    <script src="js/appff2d.js"></script>
    
Este javascript é constituído por uma função imediata que carrega a lib OTBLIB e atribui configurações e métodos
a serem utilizados pela página a ser exibida no navegador:
    
```javascript
(function() {
  var secret = '';
  var timing;
 console.log('iniciou');
  otplib.authenticator.options = {
    window: 1, // 0 identifica o token atual; 1 para o token futuro (pego através do app google authenticator); -1 para o token anterior
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
    secret = otplib.authenticator.generateSecret();

    startCountdown();

    var otpauth = otplib.authenticator.keyuri('demo', 'otplib', secret);

    document.querySelector('.otp-secret').innerHTML = secret;

    QRCode.toDataURL(otpauth, function(err, url) {
      var container = document.querySelector('.otp-qrcode .qrcode');
      if (err) {
        container.innerHTML = 'Error generating QR Code';
        return;
      }
      container.innerHTML = '<img src="' + url + '" alt="" />';
    });
  }

  function setToken(token) {
    document.querySelector('.otp-token').innerHTML = token;
  }

  function generator() {
    if (!secret) {
      window.clearInterval(timing);
      return;
    }

    const remaining = otplib.authenticator.timeRemaining();
    if (otplib.authenticator.timeUsed() === 0) {
      setToken(otplib.authenticator.generate(secret));
    }

    // time left
    document.querySelector('.otp-countdown').innerHTML = remaining + 's';
  }

  function startCountdown() {
    window.setTimeout(() => {
      if (secret) {
        setToken(otplib.authenticator.generate(secret));
      }
      timing = window.setInterval(generator, 1000);
    }, 2000);
  }

  function initVerify() {
    document
      .querySelector('.otp-verify-send')
      .addEventListener('click', function() {
        var inputValue = document.querySelector('.otp-verify-input').value;
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

```
