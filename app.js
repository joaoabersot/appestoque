const startButton = document.getElementById('startButton');
const codeList = document.getElementById('codeList');
const interactive = document.getElementById('interactive');

// Estados do leitor
let isScanning = false;
let hasDetected = false;
let codesFound = new Set(); // Usamos um Set para garantir códigos únicos

// Função principal de inicialização do Quagga
function initQuagga() {
    // 1. Resetar estado
    hasDetected = false;
    startButton.textContent = "Aguardando Leitura...";
    startButton.disabled = true; // Desabilita o botão enquanto escaneia

    // 2. Inicializar o Quagga (apenas se não estiver ativo)
    if (!isScanning) {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: interactive,
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: ["ean_reader", "code_128_reader", "upc_reader", "code_39_reader"]
            },
        }, function(err) {
            if (err) {
                console.error("Erro ao iniciar a câmera:", err);
                startButton.textContent = "Erro na Câmera";
                startButton.disabled = false;
                return;
            }
            console.log("Inicialização do Quagga concluída. Começando a escanear.");
            Quagga.start();
            isScanning = true;
            startButton.textContent = "Aguardando Leitura...";
        });
    } else {
        // Se já está inicializado, apenas garante que está rodando.
        Quagga.start();
    }
}


// Função que é chamada a cada código de barras decodificado
Quagga.onDetected(function(result) {
    if (hasDetected) {
        return; // Ignora se já detectou algo nesta sessão
    }
    
    const code = result.codeResult.code;

    // 1. Marca como detectado para parar a leitura imediata
    hasDetected = true; 
    
    // 2. Para a leitura de forma temporária (mantém a câmera ativa, mas pausa o processamento)
    Quagga.stop(); 
    
    // 3. Processa e exibe o código
    if (!codesFound.has(code)) {
        codesFound.add(code);
        console.log("Código lido:", code);
        
        // Adiciona o código à lista na tela
        const newItem = document.createElement('li');
        newItem.className = 'codeItem';
        newItem.textContent = code;
        codeList.prepend(newItem);
    }
    
    // 4. Atualiza o botão para Nova Leitura
    startButton.textContent = `LIDO: ${code} (Nova Leitura)`;
    startButton.disabled = false;
    
    // Opcional: Feedback visual/sonoro
    // if ('vibrate' in navigator) {
    //     navigator.vibrate(200);
    // }
});


// Função para gerenciar o clique do botão
startButton.addEventListener('click', () => {
    // Se o sistema já leu um código, o botão serve para iniciar uma NOVA leitura
    if (hasDetected) {
        // Reinicia a câmera e o processamento de quadros
        initQuagga(); 
    } else if (isScanning) {
        // Se estiver escaneando e o usuário clicar, para tudo
        Quagga.stop();
        isScanning = false;
        startButton.textContent = "Leitor Parado (Ativar)";
    } else {
        // Se estiver parado, inicia a leitura
        initQuagga();
    }
});

// Inicialização da interface (opcional, pode deixar para o usuário clicar)
// window.onload = () => {
//     startButton.textContent = "Clique para Iniciar";
// }
