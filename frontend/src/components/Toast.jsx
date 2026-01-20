export default function Toast({ message, type = 'success', onClose }) {
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    }[type];

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}>
            <div className="flex items-center space-x-2">
                <span>{message}</span>
                {onClose && (
                    <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}
