const startButton = document.getElementById('startButton'); // Este botão será "Capturar & Ler"
const codeList = document.getElementById('codeList');
const video = document.createElement('video'); // Usaremos um elemento <video> para exibir a prévia da câmera
const canvas = document.createElement('canvas'); // Usaremos um <canvas> para tirar a foto
const interactive = document.getElementById('interactive'); // Div para conter o vídeo e o canvas

// Adiciona o elemento de vídeo ao DOM para prévia da câmera
video.style.width = '100%';
video.style.height = 'auto';
video.autoplay = true;
interactive.appendChild(video);

// Contexto do canvas para desenhar a imagem
const context = canvas.getContext('2d');

let isCameraActive = false; // Estado para saber se a câmera está ligada

// Função para iniciar a câmera e mostrar a prévia
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: "environment", // Câmera traseira do celular
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        video.srcObject = stream;
        video.play();
        isCameraActive = true;
        startButton.textContent = "Capturar & Ler Código";
        startButton.disabled = false;
        console.log("Câmera iniciada.");
        
        // Esconde o canvas quando a câmera está ativa para mostrar o vídeo
        canvas.style.display = 'none'; 
        video.style.display = 'block';

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
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    isCameraActive = false;
    startButton.textContent = "Iniciar Câmera";
    startButton.disabled = false;
    console.log("Câmera parada.");
    
    // Mostra o canvas (se houver imagem) ou esconde ambos se não for iniciar nova leitura
    video.style.display = 'none'; 
    canvas.style.display = 'block'; // Mostra a última captura se houver
}

// Função para capturar a imagem e processar
async function captureAndDecode() {
    if (!isCameraActive || video.readyState !== video.HAVE_ENOUGH_DATA) {
        alert("Câmera não está pronta ou ativa.");
        return;
    }

    startButton.disabled = true;
    startButton.textContent = "Decodificando...";

    // Ajusta o tamanho do canvas para o tamanho do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte a imagem do canvas para Data URL (base64)
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.9);

    // Esconde o vídeo e mostra a imagem capturada no canvas
    video.style.display = 'none';
    canvas.style.display = 'block';

    // Para a câmera imediatamente após a captura
    stopCamera();

    // Inicia a decodificação da imagem
    Quagga.decodeSingle({
        src: imageDataURL,
        numOfWorkers: 0, // Importante para rodar na thread principal e ser mais rápido para uma única imagem
        decoder: {
            readers: ["ean_reader", "code_128_reader", "upc_reader", "code_39_reader", "ean_8_reader", "code_93_reader"]
        },
    }, function(result) {
        if (result && result.codeResult) {
            const code = result.codeResult.code;
            console.log("Código lido:", code);
            
            // Adiciona o código à lista
            const newItem = document.createElement('li');
            newItem.className = 'codeItem';
            newItem.textContent = code;
            codeList.prepend(newItem);

            // Feedback visual/sonoro
            if ('vibrate' in navigator) {
                navigator.vibrate(200);
            }
            startButton.textContent = "Sucesso! Iniciar Câmera para Nova Leitura";
        } else {
            console.log("Nenhum código encontrado na imagem.");
            startButton.textContent = "Não Encontrado. Iniciar Câmera para Nova Leitura";
        }
        startButton.disabled = false; // Habilita o botão para iniciar nova leitura
    });
}


// Manipulador do botão principal
startButton.addEventListener('click', () => {
    if (isCameraActive) {
        // Se a câmera já está ativa, o botão "Capturar & Ler"
        captureAndDecode();
    } else {
        // Se a câmera está parada, o botão "Iniciar Câmera"
        startCamera();
    }
});

// Inicializa a câmera ao carregar a página
window.onload = startCamera;
