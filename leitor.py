import cv2
from pyzbar.pyzbar import decode
import time


def ler_codigos():
    """
    Abre a webcam, espera ler UM código de barras válido e retorna o número.
    """
    # Inicializa a câmera
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    codigo_lido = None

    # Loop de leitura
    while True:
        success, frame = cap.read()
        if not success:
            break

        # Decodifica
        codigos = decode(frame)

        # Desenha feedback na tela para o usuário saber que está funcionando
        for code in codigos:
            # Desenha o retângulo verde
            pts = code.rect
            cv2.rectangle(frame, (pts.left, pts.top),
                          (pts.left + pts.width, pts.top + pts.height),
                          (0, 255, 0), 2)

            # Pega o dado
            codigo_lido = code.data.decode('utf-8')

            # Adiciona um pequeno texto na tela
            cv2.putText(frame, "LIDO! Fechando...", (pts.left, pts.top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        # Mostra a janela
        cv2.imshow('Leitor - Aponte o codigo', frame)

        # Se leu algo, espera meio segundo para o usuário ver o verde e encerra
        if codigo_lido:
            cv2.waitKey(500)
            break

        # Botão de emergência para sair (q)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Limpeza
    cap.release()
    cv2.destroyAllWindows()

    return codigo_lido


if __name__ == "__main__":
    print(ler_codigos())
