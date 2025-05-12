import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Importa html5-qrcode

function UserQRPrompt({ onSelf, onScan }) {
    const [qrData, setqrData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [GobiernoURL, setGobiernoURL] = useState(''); // Estado para almacenar la URL del registro civil
    const qrReaderRef = useRef(null); // Usamos useRef para obtener una referencia al div del escáner
    const scannerRef = useRef(null); // Usamos un ref para almacenar la instancia del escáner

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        const url = new URL(GobiernoURL.trim()); // Convertimos la URL ingresada a un objeto URL
        const params = new URLSearchParams(url.search); // Para luego ocupar URLSearchParams en combinación al metodo search de la clase URL para obtener los parámetros del URL
        const RUN = params.get('RUN'); // Obtenemos el RUN del URL ingresado
        onScan(RUN); // Llamamos a la función onScan con el RUN obtenido del URL
        setGobiernoURL(''); // Limpiamos el input
    };

    const handleScan = (data) => {
        if (data) {
            setqrData(data); // Guardamos los datos escaneados (el URL del registro civil)
            setIsScanning(false); // Detener el escaneo después de obtener datos
            const url = new URL(data); // Convertimos la URL escaneada a un objeto URL
            const params = new URLSearchParams(url.search); // Obtener los parámetros de la URL
            const RUN = params.get('RUN'); // Obtener el RUN del parámetro
            onScan(RUN); // Llamamos a la función onScan con el RUN obtenido del URL escaneado
        }
    };

    const handleError = (error) => {
        console.log('QR Scan Error: ', error); // Maneja errores durante el escaneo
    };

    const startScanning = () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, true); // Creamos una instancia del escáner
            scannerRef.current.render(handleScan, handleError); // Inicia el escáner y maneja los resultados
        }
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear(); // Limpiamos el escáner
            scannerRef.current = null; // Restablecemos el ref
        }
    };

    useEffect(() => {
        if (isScanning) {
            startScanning(); // Solo iniciar el escáner cuando se empieza a escanear
        } else {
            stopScanning(); // Detener el escáner si no está escaneando
        }

        return () => {
            stopScanning(); // Limpiar el escáner al desmontar el componente
        };
    }, [isScanning]); // Solo ejecuta este efecto cuando cambie isScanning

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">You have been identified as an Admin.</h1>
            <p className="mb-4">Please choose what you want to do:</p>
            <div className="flex flex-col items-center">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
                    onClick={onSelf}
                >
                    View my personal tickets
                </button>
                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded mb-2"
                    onClick={() => setIsScanning(true)} // Inicia el escaneo cuando el usuario hace clic en este botón
                >
                    Scan a user's ID QR code to view theirs
                </button>
                {isScanning && (
                    <div ref={qrReaderRef} id="qr-reader" style={{ width: '100%', height: '400px' }} />
                )}
                <form className="url-parser" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Input a valid Registro Civil URL"
                        className="urlSearch"
                        value={GobiernoURL}
                        onChange={(e) => setGobiernoURL(e.target.value)}
                    />
                    <button type="submit" value="Submit URL!" className="eventSearchButton">
                        Submit link directly if QR functionality is unavailable
                    </button>
                </form>
            </div>
            <p className="mt-4">If you have any issues with QR scanning, please contact support.</p>
        </div>
    );
}

export default UserQRPrompt;
