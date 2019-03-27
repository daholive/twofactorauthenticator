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
    
```javascript
public class Person
{
    public ObjectId Id { get; set; }
    public string Name { get; set; }
}
```
