import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { backendURL } from '../../../config.js';

function QrCode({ orderId, RUN }) {
  const canvasRef = useRef(null);
  const url = `${backendURL}/checkin?orderId=${orderId}&RUN=${RUN}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 256 }, function (error) {
        if (error) console.error(error);
      });
    }
  }, [url]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>¡Compra exitosa!</h2>
      <p>Este es tu código QR. Tómale un pantallazo.</p>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default QrCode;
