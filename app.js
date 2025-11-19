const startButton = document.getElementById('startButton');
const codeList = document.getElementById('codeList');
const video = document.createElement('video');
const canvas = document.createElement('canvas');
const interactive = document.getElementById('interactive');

// --- CORREÇÃO CRÍTICA: ADICIONANDO CANVAS AO DOM ---

// Configura e adiciona o elemento de vídeo ao DOM para prévia da câmera
video.style.width = '100%';
video.style.height = 'auto';
video.autoplay = true;
interactive.appendChild(video);

// Configura e adiciona o canvas ao DOM para captura de imagem
canvas.style.width = '100%';
canvas.style.height = 'auto';
interactive.appendChild(canvas);
canvas.style.display = 'none'; // Começa escondido

// Contexto do canvas para desenhar a imagem
const context = canvas.getContext('2d');

// --- VARIÁVEIS DE ESTADO ---
let isCameraActive = false;

// --- FUNÇÕES DE CONTROLE ---

// Função para iniciar a câmera e mostrar a prévia
async function startCamera() {
    try {
        startButton.disabled = true; // Desabilita enquanto busca a câmera
        startButton.textContent = "Iniciando Câmera...";

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment",
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        video.srcObject = stream;
        video.play();
        isCameraActive = true;
        
        // Esconde o canvas e mostra o vídeo
        canvas.style.display = 'none'; 
        video.style.display = 'block';

        startButton.textContent = "Capturar & Ler Código";
        startButton.disabled = false;
        console.log("Câmera iniciada.");

    } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        alert("Erro ao acessar a câmera. Verifique as permissões.");
        startButton.textContent = "Erro na Câmera";
        startButton.disabled = true;
    }
}

// Função para parar a câmera
function stopCamera() {
    if (video.srcObject) {
        // Interrompe todas as tracks (vídeo e áudio, se houver)
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    isCameraActive = false;
    console.log("Câmera parada.");
    
    // Esconde o vídeo (mostrando a imagem capturada no canvas)
    video.style.display = 'none'; 
    canvas.style.display = 'block'; 
}

// Função para capturar a imagem e processar
async function captureAndDecode() {
    if (!isCameraActive || video.readyState !== video.HAVE_ENOUGH_DATA) {
        alert("Câmera não está pronta ou ativa.");
        return;
    }

    startButton.disabled = true;
    startButton.textContent = "Decodificando...";

    // 1. Captura: Desenha o frame do vídeo no canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Para a câmera imediatamente
    stopCamera();

    // 3. Converte a imagem do canvas para Data URL (base64)
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.9);

    // 4. Decodificação
    Quagga.decodeSingle({
        src: imageDataURL,
        numOfWorkers: 0, 
        decoder: {
            // Garante que todos os tipos de código comuns sejam tentados
            readers: ["ean_reader", "code_128_reader", "upc_reader", "code_39_reader", "ean_8_reader", "code_93_reader", "i2of5_reader"]
        },
    }, function(result) {
        let message = "";
        if (result && result.codeResult) {
            const code = result.codeResult.code;
            
            // Adiciona o código à lista
            const newItem = document.createElement('li');
            newItem.className = 'codeItem';
            newItem.textContent = code;
            codeList.prepend(newItem);

            // Feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
            message = `Sucesso! (${code}) Iniciar Nova Leitura`;
        } else {
            message = "Não Encontrado. Iniciar Câmera para Nova Leitura";
        }

        // 5. Atualiza o botão para Nova Leitura
        startButton.textContent = message;
        startButton.disabled = false;
    });
}


// --- MANIPULADOR DO BOTÃO PRINCIPAL ---
startButton.addEventListener('click', () => {
    if (isCameraActive) {
        // Câmera ativa -> Capturar e Decodificar
        captureAndDecode();
    } else {
        // Câmera parada (após o resultado ou ao carregar) -> Iniciar Câmera
        startCamera();
    }
});

// Inicializa a câmera ao carregar a página
window.onload = startCamera;
