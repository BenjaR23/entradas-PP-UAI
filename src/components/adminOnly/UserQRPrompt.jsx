import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

function UserQRPrompt({ onSelf, onScan }) {
    const [qrData, setqrData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [GobiernoURL, setGobiernoURL] = useState(''); // Estado para almacenar la URL del registro civil

    const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
    const url = new URL (GobiernoURL.trim()); // Convertimos la URL ingresada a un objeto URL
    const params = new URLSearchParams(url.search); // Para luego ocupar URLSearchParams en combinación al metodo search de la clase URL para obtener los parámetros del URL
    const RUN = params.get('RUN'); // Obtenemos el RUN del URL ingresado
    onScan(RUN); // Llamamos a la función onScan con el RUN obtenido del URL
    setGobiernoURL(''); // Limpiamos el input
    };

   // const handleScan = (data) => {
     // if (data) {
       // setqrData(data); // Guardamos los datos escaneados (el URL del registro civil)
       // setIsScanning(false); // Detener el escaneo después de obtener datos
       // console.log(data);
     // }
    //}; Hacer algo similar a esto para el QR
    
    return (
        // Mostramos tres botones, uno para ver los tickets del admin, otro para escanear el QR y otro para ingresar la URL directamente
        // Si el admin escanea un QR, llamamos a la función onScan con el RUN del usuario escaneado
        // Si el admin elige ver sus propios tickets, llamamos a la función onSelf
        // Si el admin elige ingresar la URL directamente, llamamos a la función handleSearchSubmit con el URL del registro civil
        // Este último botón por ahora sirve de placeholder, ya que no tenemos la funcionalidad de escanear el QR implementada, pero considerar dejarlo en un futuro como alternativa
        // para que el admin pueda ingresar la URL directamente en caso de que no funcione el escaneo del QR
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
                    onClick={console.log("Feature not implemented yet!")} // Aún no implementado, pero cuando lo esté, llamar a una función que escanee el QR con camara
                >
                    Scan a user's ID QR code to view theirs
                </button>
            <form className="url-parser" onSubmit= {handleSearchSubmit}>
                <input type="text" placeholder="Input a valid Registro Civil URL" className="urlSearch" value={GobiernoURL} onChange={(e) => setGobiernoURL(e.target.value)}></input>
                <button type="submit" value="Submit URL!" className="eventSearchButton">Submit link directly if QR functionality is unavailable</button>
            </form>
            </div>
            <p className="mt-4">If you have any issues with QR scanning, please contact support.</p>
        </div> //Usamos un formulario para que el admin ingrese la URL del registro civil directamente, y al enviar el formulario, llamamos a la función handleSearchSubmit con el URL ingresado
    );
}

export default UserQRPrompt;
