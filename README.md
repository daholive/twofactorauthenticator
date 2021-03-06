# Gerador e validador de chaves utilizando Google Authenticator #

O Google Authenticator gera códigos para a verificação em duas etapas no seu smartphone.

A verificação em duas etapas oferece maior segurança para a sua Conta do Google, exigindo uma segunda etapa de verificação durante o login. Além da senha, você também precisará de um código gerado pelo app Google Authenticator no smartphone.

Foi utilizado neste experimento a biblioteca javascript chamada otplib:

    https://yeojz.github.io/otplib/docs/index.html

### Por que usar a lib OTBLIB? ###
 - **é uma biblioteca JavaScript One Time Password (OTP)**
 - **é compatível com o Google Authenticator e inclui métodos adicionais para permitir que você trabalhe com o Google Authenticator.**
 - **é um pacote que pode ser instalado via NPM e usado com Node.js**
 
### Como funciona? ###

Ao acessar o **index.html** será exibido a tela abaixo, com um chave gerada e o QR Code que ela representa. A cada "refresh" dado na tela uma nova chave é gerada.

![Chave e QR Code](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela1.png)

Na tela seguinte, é exibido um token gerado também automaticamente e com um tempo de duração que pode ser configurado.

![Token gerado automaticamente](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela2.png)

Na última tela, é feita a validação do Token. A cada validação, uma "flag" informa o status do token.

![Validação do Token](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela3.png)

Quando um token é válido, é exibido a "flag" **window:0** que significa que o token é válido.

![status token validado](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela4.png)

Quando é o token anterior ao atual, é exibido a "flag" **window:-1** que significa que o token já foi utilizado anteriormente.

![status token anterior](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela6.png)

Quando o token já foi utilizado e não é mais válido, é exibido a "flag" **Cannot verify token** que significa que o token é válido.

![status token inválido](https://github.com/daholive/twofactorauthenticator/blob/master/docs/tela5.png)

E por último é possível através do App Google Authenticator fazer a leitura do QR Code gerado e criar um novo token. Este mesmo token pode ser validado  na tela anterior de validação. Neste caso será retornado a "flag" **window:1** que significa que é um token futuro, ou seja, que pode ser utilizado assim que o token atual expirar.

![google authenticator](https://github.com/daholive/twofactorauthenticator/blob/master/docs/google_authenticator.png)


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

```


### Biblioteca utilizada para gerar e exibir o QR Code ###

QRCode.js suporta Cross-browser com HTML5 Canvas e table tag no DOM. QRCode.js não tem dependências.

    <script src="js/qrcode.min.js"></script>
    
    
 ### Alguns projetos alternativos que trabalham com a geração e validação de chaves do Google Authenticator ###
 - **PHP Sonata Project**
 
        https://packagist.org/packages/sonata-project/google-authenticator 
        
 - **Node Speakeasy**
 
        https://github.com/speakeasyjs/speakeasy 
        
 - **Java GoogleAuth**
        
        https://github.com/wstrange/GoogleAuth

- **Java Spring Two Factor Auth**

        https://www.baeldung.com/spring-security-two-factor-authentication-with-soft-token
