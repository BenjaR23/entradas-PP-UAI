function UserQRPrompt({ onSelf, onScan }) {
    

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
                    onClick={onScan}
                >
                    Scan a user's ID QR code to view theirs
                </button>
            </div>
            <img src="/path/to/qr-code.png" alt="QR Code" className="w-64 h-64" />
            <p className="mt-4">If you have any issues with QR scanning, please contact support.</p>
        </div>
    );
}

export default UserQRPrompt;