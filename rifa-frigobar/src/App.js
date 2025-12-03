import React, { useState, useEffect } from 'react';
import RaffleGrid from './components/RaffleGrid';
import './App.css';

function App() {
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [separatedNumbers, setSeparatedNumbers] = useState({});
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Calculate totals from selectedNumbers and separatedNumbers objects
  const totalTickets = Object.values(selectedNumbers).reduce((sum, qty) => sum + qty, 0);
  const totalSeparated = Object.values(separatedNumbers).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = totalTickets * 50;

  useEffect(() => {
    const targetDate = new Date('2025-12-25T21:00:00Z'); // 3 PM CST = 9 PM UTC

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNumberSelect = (number, quantity) => {
    setSelectedNumbers(prev => {
      const newSelected = { ...prev };
      if (quantity > 0) {
        newSelected[number] = quantity;
      } else {
        delete newSelected[number];
      }
      return newSelected;
    });
  };





  const separateTicket = (number, formData) => {
    const message = ` *SOLICITUD PARA SEPARAR BOLETO*

 *Datos del participante:*
• Nombre: ${formData.name}
• Teléfono: ${formData.phone}
• Número solicitado: ${number}

 *Información de pago:*
• Precio: $50
• Concepto: numero separado
• Tarjeta: 4910897092374420 (HSBC)
• Nombre: Josue Francisco Garcia Cepeda

 Sorteo: 25 de diciembre de 2025 a las 3:00 PM CST

 *IMPORTANTE:* Envía el comprobante de pago a este mismo número después de realizar la transferencia.

¡Gracias por participar! 🎉`;
    const url = `https://wa.me/8442818979?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Also update the separated numbers
    setSeparatedNumbers(prev => ({
      ...prev,
      [number]: (prev[number] || 0) + 1
    }));
  };

  const handleAdminClick = () => {
    setShowAdminModal(true);
  };

  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    const encryptedPassword = btoa('grettelbonita10');
    const inputEncrypted = btoa(adminPassword);
    if (inputEncrypted === encryptedPassword) {
      setShowAdminModal(false);
      setShowAdminPanel(true);
      setAdminPassword('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
  };

  const handleReactivateTicket = (number) => {
    setSeparatedNumbers(prev => {
      const newSeparated = { ...prev };
      delete newSeparated[number];
      return newSeparated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mainBg via-altBg to-mainBg overflow-x-hidden">
      <div className="absolute inset-0 bg-altBg bg-opacity-10"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 bg-altBg bg-opacity-10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-mainText border-opacity-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-mainText mb-2 sm:mb-4 drop-shadow-lg">
            Rifa del Frigobar
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-secText mb-4 font-medium">
            ¡Gana un hermoso frigobar!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-4">
            <div className="bg-gradient-to-r from-primary to-secondary text-mainText px-4 sm:px-6 py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-xl transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
              Precio: $50 por boleto
            </div>
            <div className="bg-gradient-to-r from-secondary to-primary text-mainText px-4 sm:px-6 py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-xl transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
              Boletos disponibles: {100 - totalTickets}
            </div>
          </div>
          <div className="w-full max-w-md mx-auto mb-4">
            <div className="bg-altBg bg-opacity-30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 ease-out"
                style={{ width: `${((100 - totalTickets - totalSeparated) / 100) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-secText mt-1 text-center">Progreso de boletos disponibles</p>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-secText font-semibold">
            Sorteo: 25 de diciembre de 2025 a las 3:00 PM CST
          </p>
        </div>

        {/* Prize Section */}
        <div className="text-center mb-8 sm:mb-12 bg-altBg bg-opacity-10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-mainText border-opacity-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-mainText mb-6 drop-shadow-lg">
            Premio: Hermoso Frigobar Tecate Edición Especial Iluminado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-mainBg bg-opacity-20 rounded-lg p-4 shadow-lg">
              <img src="/Frigobar/1.jpg" alt="Frigobar 1" className="w-full h-auto object-contain rounded-lg mb-2" />
            </div>
            <div className="bg-mainBg bg-opacity-20 rounded-lg p-4 shadow-lg">
              <img src="/Frigobar/2.jpg" alt="Frigobar 2" className="w-full h-auto object-contain rounded-lg mb-2" />
            </div>
            <div className="bg-mainBg bg-opacity-20 rounded-lg p-4 shadow-lg sm:col-span-2 lg:col-span-1">
              <img src="/Frigobar/3.jpg" alt="Frigobar 3" className="w-full h-auto object-contain rounded-lg mb-2" />
            </div>
          </div>
        </div>

        {/* Raffle Grid */}
        <RaffleGrid
          selectedNumbers={selectedNumbers}
          separatedNumbers={separatedNumbers}
          onNumberSelect={handleNumberSelect}
          onSeparate={separateTicket}
          totalTickets={totalTickets}
          totalPrice={totalPrice}
        />

        {/* Live Event Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 bg-altBg bg-opacity-10 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-mainText border-opacity-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-mainText mb-6 sm:mb-8 drop-shadow-lg">
             Sorteo en Vivo por YouTube
          </h2>
          <div className="text-center">
            <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-xl inline-block mb-4">
               Fecha: 25 de diciembre de 2025
            </div>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-xl inline-block mb-6">
               Hora: 3:00 PM CST
            </div>
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">⏰ Tiempo restante para el sorteo:</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.days}</div>
                  <div className="text-xs sm:text-sm text-white">Días</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.hours}</div>
                  <div className="text-xs sm:text-sm text-white">Horas</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.minutes}</div>
                  <div className="text-xs sm:text-sm text-white">Minutos</div>
                </div>
              </div>
            </div>
            <p className="text-lg sm:text-xl text-secText mb-4 font-medium">
              El enlace del sorteo en vivo se subirá el día del evento.
            </p>
            <p className="text-base sm:text-lg text-secText">
              ¡No te lo pierdas! El sorteo será transmitido en vivo para asegurar la transparencia y emoción del momento.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-white to-altBg bg-opacity-10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-white border-opacity-20">
          <p className="text-lg sm:text-xl text-black font-medium mb-4">
            ¡No te quedes sin tu boleto! El sorteo se acerca.
          </p>
          <div className="mt-6 text-sm text-black">
            <p>© 2025 <span onClick={handleAdminClick} className="cursor-pointer hover:text-blue-600">Josue Garcia</span> - Todos los derechos reservados</p>
          </div>
        </div>

        {/* Admin Password Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Acceso Administrador
              </h3>
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa la contraseña"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Acceder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Panel de Administración - Boletos Separados
                </h3>
                <button
                  onClick={handleCloseAdminPanel}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(separatedNumbers).map(([number, quantity]) => (
                  <div key={number} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-red-800">Número {number}</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {quantity}
                      </span>
                    </div>
                    <button
                      onClick={() => handleReactivateTicket(parseInt(number))}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Reactivar Boleto
                    </button>
                  </div>
                ))}
              </div>
              {Object.keys(separatedNumbers).length === 0 && (
                <p className="text-center text-gray-500 mt-8">No hay boletos separados actualmente.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
