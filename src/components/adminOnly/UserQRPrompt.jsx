import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

function UserQRPrompt({ onSelf, onScan }) {
    const [qrData, setqrData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    
    const handleScan = (data) => {
        if (data) {
            setqrData(data); // Guardamos los datos escaneados (el URL del registro civil)
            setIsScanning(false); // Detener el escaneo después de obtener datos
            console.log(data);
        }
    };
    
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
                    onClick={() => {
                        setIsScanning(true); // Establecemos el estado de escaneo a true para iniciarlo
                        }}
                >
                    Scan a user's ID QR code to view theirs
                </button>
                {isScanning && (
                    <QrReader
                        delay={300}
                        onError={(err) => console.error(err)}
                        onScan={handleScan}
                        style={{ width: '100%' }}
                    />
                )}
            </div>
            <p className="mt-4">If you have any issues with QR scanning, please contact support.</p>
        </div>
    );
}

export default UserQRPrompt;