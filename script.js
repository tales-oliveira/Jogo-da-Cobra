const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 20x20 pix
const boxSize = 20;

// Variáveis de estado do jogo
let score = 0;               // Pontuação atual
let gameInterval = null;     // Referência do intervalo que controla o loop do jogo
let gameActive = false;      // Indica se o jogo está em andamento

// ==============================================
// ELEMENTOS DO DOM (Interface)
// ==============================================

const startBtn = document.getElementById("startBtn");            // inicia jogo
const speedSelect = document.getElementById("speed");            // seletor de velocidade
const menu = document.querySelector(".menu");                    // menu principal
const gameContainer = document.querySelector(".game-container"); // área do jogo (canvas + placar)
const scoreElement = document.getElementById("score");           // Elemento que mostra a pontuação

// ==============================================
// VARIÁVEIS DO JOGO
// ==============================================
let snake;      // array que armazena as posições de cada segmento da cobra
let food;       // objeto com as coordenadas da comida
let direction;  // direção atual da cobra ("UP", "DOWN", "LEFT", "RIGHT")

// ==============================================
// EVENT LISTENERS (Ouvintes de Eventos)
// ==============================================

// Quando o botão "Iniciar Jogo" for clicado, chama a função startGame
startBtn.addEventListener("click", startGame);

// Quando o seletor de velocidade mudar, chama a função updateSpeed
speedSelect.addEventListener("change", updateSpeed);

// Escuta eventos de teclado para mover a cobra
document.addEventListener("keydown", changeDirection);

// ==============================================
// FUNÇÃO: changeDirection
// Alterar a direção da cobra com base na tecla pressionada
// ==============================================
function changeDirection(event) {
    if (!gameActive) return;
    
    // obtém qual tecla está pressionada
    const key = event.key;
    
    // Impede que a página role com as teclas de seta
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "a", "A", "s", "S", "d", "D"].includes(key)) {
        event.preventDefault();
    }
    
    // ===== DIREÇÃO (SETAS) =====
    // Seta para esquerda (ArrowLeft) - Não pode ir para a direita se já estiver indo para esquerda
    if ((key === "a" || key === "A" || key === "ArrowLeft") && direction !== "RIGHT") direction = "LEFT";
    
    // Seta para cima (ArrowUp) - Não pode ir para baixo se já estiver indo para cima
    if ((key === "w" || key === "W" || key === "ArrowUp") && direction !== "DOWN") direction = "UP";
    
    // Seta para direita (ArrowRight) - Não pode ir para esquerda se já estiver indo para direita
    if ((key === "d" || key === "D" || key === "ArrowRight") && direction !== "LEFT") direction = "RIGHT";
    
    // Seta para baixo (ArrowDown) - Não pode ir para cima se já estiver indo para baixo
    if ((key === "s" || key === "S" || key === "ArrowDown") && direction !== "UP") direction = "DOWN";
}

// ==============================================
// FUNÇÃO: startGame
// Inicia o jogo, esconde o menu, mostra o canvas e começa o loop
// ==============================================
function startGame() {
    // Esconde o menu principal
    menu.style.display = "none";
    
    // Mostra a área do jogo (canvas + placar)
    gameContainer.style.display = "block";
    
    // Reinicia as variáveis do jogo (cobra, comida, pontuação)
    resetGame();
    
    // Se já existir um jogo em andamento, limpa o anterior
    if(gameInterval){
        clearInterval(gameInterval);
    }

    // Obtém a velocidade selecionada (em ms) e inicia o loop do jogo
    const speed = parseInt(speedSelect.value);
    gameInterval = setInterval(gameLoop, speed);
    
    // Marca o jogo como ativo
    gameActive = true;
}

// ==============================================
// FUNÇÃO: resetGame
// Reinicia todas as variáveis do jogo para o estado inicial
// ==============================================
function resetGame() {
    // Cobra começa com apenas um segmento no centro do canvas
    snake = [
        { x: 9 * boxSize, y: 10 * boxSize } // Posição inicial (9,10) no grid
    ];
    
    // Comida aparece em posição aleatória
    food = {
        x: Math.floor(Math.random() * 20) * boxSize,
        y: Math.floor(Math.random() * 20) * boxSize
    };
    
    // Direção inicial: direita
    direction = "RIGHT";
    
    // Pontuação zero
    score = 0;
    scoreElement.textContent = score;
}

// ==============================================
// FUNÇÃO: updateSpeed
// Atualiza a velocidade do jogo quando o seletor é alterado
// ==============================================
function updateSpeed() {
    // Só altera a velocidade se o jogo estiver em andamento
    if (gameActive) {
        // Para o loop atual
        clearInterval(gameInterval);
        
        // Inicia um novo loop com a nova velocidade
        const speed = parseInt(speedSelect.value);
        gameInterval = setInterval(gameLoop, speed);
    }
}

// ==============================================
// FUNÇÃO: gameLoop
// Loop principal do jogo - executado em intervalos regulares
// ==============================================
function gameLoop() {
    // Limpa todo o canvas para redesenhar o frame atual
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ===== DESENHA A COBRA =====
    for (let i = 0; i < snake.length; i++) {
        // Cabeça dourada, corpo laranja
        const tom = i === 0 ? "#ffd700" : "#ff4500";
        ctx.fillStyle = tom;
        ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
        
        // Borda preta entre os segmentos
        ctx.strokeStyle = "#1a1a2e";
        ctx.strokeRect(snake[i].x, snake[i].y, boxSize, boxSize);
        
        // Adiciona olhos na cabeça da cobra (apenas no primeiro segmento)
        if (i === 0) {
            ctx.fillStyle = "#000";
            ctx.fillRect(snake[i].x + 5, snake[i].y + 5, 3, 3);  // Olho esquerdo
            ctx.fillRect(snake[i].x + 12, snake[i].y + 5, 3, 3); // Olho direito
        }
    }

    // ===== DESENHA A COMIDA =====
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(food.x + boxSize/2, food.y + boxSize/2, boxSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Efeito de brilho ao redor da comida
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0; // Reseta a sombra para não afetar outros desenhos

    // ===== MOVIMENTA A COBRA =====
    // Pega a posição atual da cabeça
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Calcula a nova posição baseada na direção
    if (direction === "LEFT")  snakeX -= boxSize;
    if (direction === "UP")    snakeY -= boxSize;
    if (direction === "RIGHT") snakeX += boxSize;
    if (direction === "DOWN")  snakeY += boxSize;

    // ===== VERIFICA COLISÃO COM A COMIDA =====
    if (snakeX === food.x && snakeY === food.y) {
        // Se comeu a comida: aumenta pontuação e gera nova comida
        score += 10;
        scoreElement.textContent = score;
        
        // Gera nova comida em posição aleatória
        food = {
            x: Math.floor(Math.random() * 20) * boxSize,
            y: Math.floor(Math.random() * 20) * boxSize
        };
        // Não remove o último segmento (cobra cresce)
    } else {
        // Se não comeu: remove o último segmento (cobra anda)
        snake.pop();
    }

    // Cria o novo segmento (cabeça) na posição calculada
    const newHead = { x: snakeX, y: snakeY };

    // ===== VERIFICA COLISÕES COM PAREDES OU CORPO =====
    // Colisão com paredes (saiu dos limites do canvas)
    if (
        snakeX < 0 || snakeX >= canvas.width ||
        snakeY < 0 || snakeY >= canvas.height ||
        collision(newHead, snake) // Colisão com o próprio corpo
    ) {
        gameOver(); // Fim de jogo
    }

    // Adiciona a nova cabeça ao início do array (frente da cobra)
    snake.unshift(newHead);
}

// ==============================================
// FUNÇÃO: collision
// Verifica se a cabeça colidiu com algum segmento do corpo
// Retorna: true se houve colisão, false caso contrário
// ==============================================
function collision(head, body) {
    for (let i = 0; i < body.length; i++) {
        // Compara as coordenadas da cabeça com cada segmento do corpo
        if (head.x === body[i].x && head.y === body[i].y) {
            return true; // Colisão detectada
        }
    }
    return false; // Nenhuma colisão
}

// ==============================================
// FUNÇÃO: gameOver
// Finaliza o jogo atual e pergunta se quer jogar novamente
// ==============================================
function gameOver() {
    // Para o loop do jogo
    clearInterval(gameInterval);
    gameActive = false;
    
    // Exibe mensagem com a pontuação
    const playAgain = confirm(`💀 GAME OVER! 💀\n\nPONTUAÇÃO: ${score}\n\nDeseja jogar novamente?`);
    
    // Volta ao menu (seja "OK" ou "Cancelar")
    menu.style.display = "block";
    gameContainer.style.display = "none";
}

// ==============================================
// FUNÇÃO: returnToMenu
// Retorna ao menu principal sem mensagem de confirmação
// ==============================================
function returnToMenu() {
    // Para o jogo se estiver em andamento
    if (gameInterval) {
        clearInterval(gameInterval);
        gameActive = false;
    }
    // Mostra o menu e esconde o jogo
    menu.style.display = "block";
    gameContainer.style.display = "none";
}