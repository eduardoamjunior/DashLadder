// particle.min.js modificado

!(function (a) {
    // Configura o módulo para funcionar com AMD, CommonJS ou como variável global.
    var b =
      ("object" == typeof self && self.self === self && self) ||
      ("object" == typeof global && global.global === global && global);
    "function" == typeof define && define.amd
      ? define(["exports"], function (c) {
          b.ParticleNetwork = a(b, c);
        })
      : "object" == typeof module && module.exports
      ? (module.exports = a(b, {}))
      : (b.ParticleNetwork = a(b, {}));
  })(function (a, b) {
    // Construtor para cada partícula
    var c = function (a) {
      // Recebe o canvas, o contexto e as opções de cores e velocidade
      this.canvas = a.canvas;
      this.g = a.g;
      this.particleColor = a.options.particleColor;
      // Posição inicial aleatória dentro do canvas
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      // Velocidade aleatória para X e Y
      this.velocity = {
        x: (Math.random() - 0.5) * a.options.velocity,
        y: (Math.random() - 0.5) * a.options.velocity
      };
    };
  
    // Atualiza a posição da partícula e inverte a direção se sair da tela
    c.prototype.update = function () {
      if (this.x > this.canvas.width + 20 || this.x < -20)
        this.velocity.x = -this.velocity.x;
      if (this.y > this.canvas.height + 20 || this.y < -20)
        this.velocity.y = -this.velocity.y;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    };
  
    // Desenha a partícula no canvas
    c.prototype.h = function () {
      this.g.beginPath();
      this.g.fillStyle = this.particleColor;
      this.g.globalAlpha = 0.7;
      this.g.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      this.g.fill();
    };
  
    // Construtor da rede de partículas (ParticleNetwork)
    b = function (a, b) {
      // 'a' é o elemento pai, 'b' são as opções do usuário
      this.i = a;
      this.i.size = {
        width: this.i.offsetWidth,
        height: this.i.offsetHeight
      };
      b = void 0 !== b ? b : {};
      this.options = {
        particleColor:
          void 0 !== b.particleColor ? b.particleColor : "#fff",
        // A opção "background" não é usada pelo JS; fica definida no CSS
        background:
          void 0 !== b.background ? b.background : "#1a252f",
        interactive:
          void 0 !== b.interactive ? b.interactive : !0,
        velocity: this.setVelocity(b.speed),
        density: this.j(b.density)
      };
      this.init();
    };
  
    // Inicializa a rede de partículas: cria o canvas e configura eventos
    b.prototype.init = function () {
      // Cria o canvas onde as partículas serão desenhadas
      this.canvas = document.createElement("canvas");
      this.i.appendChild(this.canvas);
      this.g = this.canvas.getContext("2d");
      // Ajusta o tamanho do canvas ao tamanho do elemento pai
      this.canvas.width = this.i.size.width;
      this.canvas.height = this.i.size.height;
      // Define o posicionamento do elemento pai e do canvas
      this.l(this.i, { position: "relative" });
      this.l(this.canvas, { "z-index": "20", position: "relative" });
      // Atualiza o tamanho e recria partículas quando a janela é redimensionada
      window.addEventListener(
        "resize",
        function () {
          if (
            this.i.offsetWidth === this.i.size.width &&
            this.i.offsetHeight === this.i.size.height
          ) {
            return !1;
          } else {
            this.canvas.width = this.i.size.width = this.i.offsetWidth;
            this.canvas.height = this.i.size.height = this.i.offsetHeight;
            clearTimeout(this.m);
            this.m = setTimeout(
              function () {
                this.o = [];
                // Cria as partículas com base na área do canvas e na densidade definida
                for (
                  var a = 0;
                  a < (this.canvas.width * this.canvas.height) / this.options.density;
                  a++
                ) {
                  this.o.push(new c(this));
                }
                // Se for interativo, adiciona uma partícula extra para interação
                this.options.interactive && this.o.push(this.p);
                requestAnimationFrame(this.update.bind(this));
              }.bind(this),
              500
            );
          }
        }.bind(this)
      );
      this.o = [];
      // Cria as partículas iniciais
      for (
        var a = 0;
        a < (this.canvas.width * this.canvas.height) / this.options.density;
        a++
      ) {
        this.o.push(new c(this));
      }
      // Configura a interação do mouse
      if (this.options.interactive) {
        // Partícula que segue o mouse
        this.p = new c(this);
        this.p.velocity = { x: 0, y: 0 };
        this.o.push(this.p);
        this.canvas.addEventListener(
          "mousemove",
          function (a) {
            this.p.x = a.clientX - this.canvas.offsetLeft;
            this.p.y = a.clientY - this.canvas.offsetTop;
          }.bind(this)
        );
        // Em clique, recria a partícula para continuar a interação
        this.canvas.addEventListener(
          "mouseup",
          function (a) {
            this.p.velocity = {
              x: (Math.random() - 0.5) * this.options.velocity,
              y: (Math.random() - 0.5) * this.options.velocity
            };
            this.p = new c(this);
            this.p.velocity = { x: 0, y: 0 };
            this.o.push(this.p);
          }.bind(this)
        );
      }
      // Inicia a animação
      requestAnimationFrame(this.update.bind(this));
    };
  
    // Atualiza o canvas: limpa, redesenha partículas e conecta-as com linhas
    b.prototype.update = function () {
      // Limpa o canvas
      this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.g.globalAlpha = 1;
      // Para cada partícula, atualiza posição e desenha
      for (var a = 0; a < this.o.length; a++) {
        this.o[a].update();
        this.o[a].h();
        // Desenha linhas conectando partículas próximas
        for (var b = this.o.length - 1; b > a; b--) {
          var c = Math.sqrt(
            Math.pow(this.o[a].x - this.o[b].x, 2) +
            Math.pow(this.o[a].y - this.o[b].y, 2)
          );
          if (c <= 120) {
            this.g.beginPath();
            this.g.strokeStyle = this.options.particleColor;
            this.g.globalAlpha = (120 - c) / 120;
            this.g.lineWidth = 0.7;
            this.g.moveTo(this.o[a].x, this.o[a].y);
            this.g.lineTo(this.o[b].x, this.o[b].y);
            this.g.stroke();
          }
        }
      }
      // Se a velocidade não for zero, continua a animação
      if (this.options.velocity !== 0) {
        requestAnimationFrame(this.update.bind(this));
      }
    };
  
    // Define a velocidade com base na opção escolhida
    b.prototype.setVelocity = function (a) {
      return "fast" === a
        ? 1
        : "slow" === a
        ? 0.33
        : "none" === a
        ? 0
        : 0.66;
    };
  
    // Define a densidade das partículas com base na opção escolhida
    b.prototype.j = function (a) {
      return "high" === a
        ? 5000
        : "low" === a
        ? 20000
        : isNaN(parseInt(a, 10))
        ? 10000
        : a;
    };
  
    // Função utilitária para aplicar estilos CSS a um elemento
    b.prototype.l = function (a, b) {
      for (var c in b) {
        a.style[c] = b[c];
      }
    };
  
    return b;
  });
  
  // Inicialização
  
  var canvasDiv = document.getElementById("particle-canvas");
  var options = {
    particleColor: "#888",
    // O fundo é definido pelo CSS do elemento "particle-canvas"
    background: "#1a252f",
    interactive: true,
    speed: "low",
    density: "medium"  // Altere para "low" ou um valor numérico maior para ter menos partículas
  };
  var particleCanvas = new ParticleNetwork(canvasDiv, options);