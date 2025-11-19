const startButton = document.getElementById('startButton');
const codeList = document.getElementById('codeList');
let isScanning = false;
let codesFound = new Set(); // Usamos um Set para garantir códigos únicos

// Função principal de inicialização do Quagga
function initQuagga() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'), // Onde o vídeo vai aparecer
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // 'environment' usa a câmera traseira do celular
            },
        },
        decoder: {
            // Defina os tipos de códigos que você quer ler (Code 128, EAN, QR, etc.)
            readers: ["ean_reader", "code_128_reader", "upc_reader", "code_39_reader"] 
        },
    }, function(err) {
        if (err) {
            console.log(err);
            alert("Erro ao iniciar a câmera: " + err.name);
            return;
        }
        console.log("Inicialização do Quagga concluída. Começando a escanear.");
        Quagga.start();
        isScanning = true;
        startButton.textContent = "Parar Leitor";
    });

    // Função que é chamada a cada código de barras decodificado
    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        
        // Verifica se o código é novo (para evitar leituras múltiplas e rápidas do mesmo código)
        if (!codesFound.has(code)) {
            codesFound.add(code);
            console.log("Código lido:", code);
            
            // Adiciona o código à lista na tela
            const newItem = document.createElement('li');
            newItem.className = 'codeItem';
            newItem.textContent = code;
            codeList.prepend(newItem); // Adiciona no topo da lista
            
            // Opcional: Efeito visual/sonoro para feedback (seu código python usava um delay)
            // Você pode vibrar o celular ou tocar um som curto aqui.
        }
    });
}

// Função para parar o Quagga
function stopQuagga() {
    Quagga.stop();
    isScanning = false;
    startButton.textContent = "Ativar Leitor";
    console.log("Leitura parada.");
}

// Manipulador do botão
startButton.addEventListener('click', () => {
    if (isScanning) {
        stopQuagga();
    } else {
        initQuagga();
    }
});