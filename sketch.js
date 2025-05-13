let balls = [];                 // array para guardar as bolinhas
const n = 10;                   // número de colunas
const diameter = 400 / n;       // diâmetro de cada bolinha
const stepX = 400 / (1.035 * n);// espaço horizontal entre colunas
const stepY = 400 / (2.5 * n);  // espaço vertical entre bolinhas
let minY, maxY, totalHeight;    // pra calcular altura total do “loop” de cada coluna
const totalFrames = 120;        // duração da animação em quadros

let colAnimFrames = [];         // para controlar a animação de cada coluna

function setup() {
  createCanvas(400, 400);       // cria área de desenho 400×400px

  // inicializa limites de Y
  minY = Infinity;
  maxY = -Infinity;

  let col_alternator = 1;       // alterna cor entre branco e preto
  let pos_alternator = 1;       // alterna direção inicial (de cima pra baixo ou vice-versa)

  // cria todas as bolinhas posicionadas em linhas e colunas
  for (let i = 0; i <= n; i++) {
    let x = 10 + i * stepX;                             // posição X da coluna
    let y = pos_alternator > 0 ? -20 : 420;             // começa acima ou abaixo do canvas

    for (let j = 0; j < 3 * n; j++) {
      y += pos_alternator * stepY;                      // posiciona cada bolinha na coluna
      const fillColor = col_alternator > 0 ? 255 : 0;   // branco ou preto
      balls.push({ col: i, x, initialY: y, y, fillColor });
      // atualiza limites mínimo e máximo de Y
      minY = min(minY, y);
      maxY = max(maxY, y);
      col_alternator *= -1;                             // troca cor pra próxima bolinha
    }
    col_alternator *= -1;                               // ajusta alternância ao mudar de coluna
    pos_alternator *= -1;                               // inverte sentido da próxima coluna
  }

  totalHeight = maxY - minY;                           // calcula altura total do ciclo
  colAnimFrames = Array(n + 1).fill(-1);               // inicia sem animação em cada coluna
}

function draw() {
  background(255);    // fundo branco
  noStroke();         // sem contorno nas formas

  // === 1) Rotação global do canvas ===
  push();                            
    translate(width / 2, height / 2);      // move origem pro centro
    rotate(frameCount * 0.002);            // gira devagar conforme frameCount
    translate(-width / 2, -height / 2);    // volta origem pro canto superior

    // === 2) Atualiza contadores de animação de cada coluna ===
    for (let col = 0; col <= n; col++) {
      if (colAnimFrames[col] >= 0) {               // se aquela coluna está animando
        colAnimFrames[col]++;                     // avança quadro
        if (colAnimFrames[col] > totalFrames) {   // animação acabou?
          colAnimFrames[col] = -1;                // reinicia animação
        }
      }
    }

    // === 3) Desenha cada bolinha ===
    for (let b of balls) {
      const f = colAnimFrames[b.col];
      if (f >= 0) {
        // calcula progresso t de 0 a 1
        const t = f / totalFrames;
        // ease in/out para movimento mais suave
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const offset = eased * totalHeight;
        // calcula posição Y “enrolada” dentro do ciclo
        const y = b.initialY - offset;
        const r = ((y - minY) % totalHeight + totalHeight) % totalHeight;
        b.y = minY + r;

        // ângulo local proporcional ao eased (para rodar a bolinha)
        b._angle = eased * TWO_PI;
      } else {
        b.y = b.initialY;  // sem animação, fica na posição inicial
        b._angle = 0;      // sem rotação local
      }

      // ===== desenha a bolinha com rotação local =====
      push();
        translate(b.x, b.y);       // vai pro centro da bolinha
        rotate(b._angle);          // rotaciona conforme animação
        fill(b.fillColor);         // aplica cor
        circle(0, 0, diameter);    // desenha no (0,0), já traduzido
      pop();
    }

  pop();  // encerra rotação global
}

function mousePressed() {
  // ao clicar, detecta em qual coluna foi e inicia animação dessa coluna
  for (let b of balls) {
    if (dist(mouseX, mouseY, b.x, b.y) < diameter / 2) {
      if (colAnimFrames[b.col] < 0) {
        colAnimFrames[b.col] = 0;  // começa animação da coluna
      }
      break;  // só ativa uma coluna por clique
    }
  }
}
