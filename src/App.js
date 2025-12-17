import React, { useState, useEffect } from 'react';
import RaffleGrid from './components/RaffleGrid';
import db from './lib/database';
import './App.css';

function App() {
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [separatedNumbers, setSeparatedNumbers] = useState([]);
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newSeparatedTicket, setNewSeparatedTicket] = useState({ number: '', name: '', phone: '' });
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  // Calculate totals from selectedNumbers and separatedNumbers objects
  const totalTickets = Object.values(selectedNumbers).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = totalTickets * 50;

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data in parallel for better performance
        const [selectedNumbersData, separatedNumbersData, soldNumbersData] = await Promise.all([
          db.get('selectedNumbers') || {},
          db.get('separatedNumbers') || [],
          db.get('soldNumbers') || []
        ]);
        setSelectedNumbers(selectedNumbersData);
        setSeparatedNumbers(separatedNumbersData);
        setSoldNumbers(soldNumbersData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);



  useEffect(() => {
    const targetDate = new Date('2025-12-25T21:00:00Z'); // 3 PM CST = 9 PM UTC

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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





  const separateTickets = async (numbers, formData) => {
    // Update the separated numbers first
    const newSeparated = [...separatedNumbers, ...numbers.map(number => ({ number, ...formData }))];
    setSeparatedNumbers(newSeparated);

    // Send WhatsApp message immediately for faster user experience
    const numbersList = numbers.join(', ');
    const totalAmount = numbers.length * 50;
    const message = ` *SOLICITUD PARA SEPARAR BOLETOS*

 *Datos del participante:*
• Nombre: ${formData.name}
• Teléfono: ${formData.phone}
• Números solicitados: ${numbersList}

 *Información de pago:*
• Precio por boleto: $50
• Cantidad de boletos: ${numbers.length}
• Total a pagar: $${totalAmount}
• Concepto: "numero(s) separado"
• Tarjeta: 4910897092374420 (HSBC)
• Nombre: Josue Francisco Garcia Cepeda

 Sorteo: 25 de diciembre de 2025 a las 3:00 PM CST

 *IMPORTANTE:* Envía el comprobante de pago a este mismo número después de realizar la transferencia/deposito.

¡Gracias por participar! `;
    const url = `https://wa.me/8442818979?text=${encodeURIComponent(message)}`;
    window.location.href = url;

    // Save to PocketBase in the background to ensure persistence
    try {
      await db.set('separatedNumbers', newSeparated);
    } catch (error) {
      console.error('Error saving to database:', error);
      // Note: User already got the WhatsApp message, data will be saved on next load
    }
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



  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setEditForm({ name: ticket.name, phone: ticket.phone });
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      const updatedTicket = { ...editingTicket, name: editForm.name, phone: editForm.phone };
      await db.updateSeparatedTicket(updatedTicket);
      const newSeparated = separatedNumbers.map(ticket =>
        ticket.id === editingTicket.id ? updatedTicket : ticket
      );
      setSeparatedNumbers(newSeparated);
      setEditingTicket(null);
      setEditForm({ name: '', phone: '' });
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error al actualizar el boleto');
    }
  };

  const handleDeleteTicket = async (ticket) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este boleto?')) {
      try {
        await db.deleteSeparatedTicket(ticket.id);
        const newSeparated = separatedNumbers.filter(t => t.id !== ticket.id);
        setSeparatedNumbers(newSeparated);
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Error al eliminar el boleto');
      }
    }
  };

  const handleAddSeparatedTicket = async (e) => {
    e.preventDefault();
    const number = parseInt(newSeparatedTicket.number);
    if (number >= 1 && number <= 100 && newSeparatedTicket.name && newSeparatedTicket.phone) {
      const newSeparated = [...separatedNumbers, { number, name: newSeparatedTicket.name, phone: newSeparatedTicket.phone }];
      setSeparatedNumbers(newSeparated);
      await db.set('separatedNumbers', newSeparated);
      setNewSeparatedTicket({ number: '', name: '', phone: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mainBg via-altBg to-mainBg overflow-x-hidden">
      <div className="absolute inset-0 bg-altBg bg-opacity-10"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 bg-opacity-95 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-4 border-yellow-400 border-opacity-70 relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2 sm:mb-4 drop-shadow-2xl animate-bounce">
              🎉 Rifa del Frigobar 🎉
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-yellow-200 mb-4 font-bold animate-pulse">
              ¡Gana un hermoso frigobar! 🏆
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-800 px-6 sm:px-8 py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-3xl border-2 border-yellow-300 animate-pulse">
                💰 Precio: $50 por boleto 💰
              </div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-white font-bold animate-pulse drop-shadow-lg">
              📅 Sorteo: 25 de diciembre de 2025 a las 3:00 PM CST ⏰
            </p>
          </div>
        </div>

        {/* Live Event Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-opacity-95 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-4 border-yellow-400 border-opacity-70 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
          <div className="relative z-10 text-center">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-red-800 px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-2xl mb-4 animate-bounce border-2 border-yellow-300">
              🔥 EN VIVO 🔥
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-white mb-6 sm:mb-8 drop-shadow-2xl animate-pulse">
               🎉 Sorteo en Vivo por YouTube 🎉
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-2xl inline-block animate-pulse border-2 border-red-400">
                 📅 Fecha: 25 de diciembre de 2025
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-2xl inline-block animate-pulse border-2 border-blue-400">
                 🕒 Hora: 3:00 PM CST
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg animate-pulse">⏰ Tiempo restante para el sorteo:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-yellow-300 animate-pulse">
                  <div className="text-2xl sm:text-3xl font-bold text-red-800 drop-shadow-lg">{timeLeft.days}</div>
                  <div className="text-xs sm:text-sm text-red-900 font-bold">Días</div>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-blue-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-green-300 animate-pulse">
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.hours}</div>
                  <div className="text-xs sm:text-sm text-green-900 font-bold">Horas</div>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-purple-300 animate-pulse">
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.minutes}</div>
                  <div className="text-xs sm:text-sm text-purple-900 font-bold">Minutos</div>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-pink-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-red-300 animate-pulse">
                  <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.seconds}</div>
                  <div className="text-xs sm:text-sm text-red-900 font-bold">Segundos</div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <a href="https://www.youtube.com/live/-AgH3MKoKcM?si=Zv73TMNWYxUn1Ev5" target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl hover:from-red-700 hover:via-red-800 hover:to-red-900 transition-all duration-300 transform hover:scale-110 hover:shadow-3xl border-2 border-red-400 animate-pulse">
                <svg className="w-8 h-8 mr-3 animate-spin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                🚀 ¡Haz clic para ver el sorteo en vivo en YouTube! 🚀
              </a>
            </div>
            <p className="text-lg sm:text-xl text-white font-bold animate-pulse drop-shadow-lg">
              ✨ ¡No te lo pierdas! El sorteo será transmitido en vivo para asegurar la transparencia y emoción del momento. ✨
            </p>
          </div>
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
          soldNumbers={soldNumbers}
          onNumberSelect={handleNumberSelect}
          onSeparateTickets={separateTickets}
          totalTickets={totalTickets}
          totalPrice={totalPrice}
        />

        {/* Live Event Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-opacity-95 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-4 border-cyan-400 border-opacity-70 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-white mb-6 sm:mb-8 drop-shadow-2xl">
               📺 Sorteo en Vivo por YouTube 📺
            </h2>
            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-2xl inline-block border-2 border-red-400">
                   📅 Fecha: 25 de diciembre de 2025
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-2xl inline-block border-2 border-blue-400">
                   🕒 Hora: 3:00 PM CST
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">⏰ Tiempo restante para el sorteo:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-yellow-300">
                    <div className="text-2xl sm:text-3xl font-bold text-red-800 drop-shadow-lg">{timeLeft.days}</div>
                    <div className="text-xs sm:text-sm text-red-900 font-bold">Días</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-blue-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-green-300">
                    <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.hours}</div>
                    <div className="text-xs sm:text-sm text-green-900 font-bold">Horas</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-pink-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-purple-300">
                    <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.minutes}</div>
                    <div className="text-xs sm:text-sm text-purple-900 font-bold">Minutos</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-400 to-pink-500 bg-opacity-30 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-2xl border-2 border-red-300">
                    <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.seconds}</div>
                    <div className="text-xs sm:text-sm text-red-900 font-bold">Segundos</div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <a href="https://www.youtube.com/live/-AgH3MKoKcM?si=Zv73TMNWYxUn1Ev5" target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl hover:from-red-700 hover:via-red-800 hover:to-red-900 transition-all duration-300 transform hover:scale-110 hover:shadow-3xl border-2 border-red-400">
                  <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  🚀 ¡Haz clic para ver el sorteo en vivo en YouTube! 🚀
                </a>
              </div>
              <p className="text-base sm:text-lg text-white font-bold drop-shadow-lg">
                ✨ ¡No te lo pierdas! El sorteo será transmitido en vivo para asegurar la transparencia y emoción del momento. ✨
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 bg-opacity-95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-indigo-400 border-opacity-70 relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
          <div className="relative z-10">
            <p className="text-lg sm:text-xl text-white font-bold mb-4 animate-pulse drop-shadow-lg">
              🚨 ¡No te quedes sin tu boleto! El sorteo se acerca. 🚨
            </p>
            <div className="mt-6 text-sm text-white font-bold animate-pulse">
              <p>© 2025 <span onClick={handleAdminClick} className="cursor-pointer hover:text-yellow-300 transition-colors animate-pulse">👨‍💻 Josue Garcia</span> - Todos los derechos reservados</p>
            </div>
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
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Agregar Boleto Separado</h4>
                <form onSubmit={handleAddSeparatedTicket} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="Número"
                    value={newSeparatedTicket.number}
                    onChange={(e) => setNewSeparatedTicket({...newSeparatedTicket, number: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newSeparatedTicket.name}
                    onChange={(e) => setNewSeparatedTicket({...newSeparatedTicket, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newSeparatedTicket.phone}
                    onChange={(e) => setNewSeparatedTicket({...newSeparatedTicket, phone: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Agregar
                  </button>
                </form>
              </div>
              {editingTicket && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Editar Boleto Separado - Número {editingTicket.number}</h4>
                  <form onSubmit={handleUpdateTicket} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={editForm.name}
                      onChange={(e) => setEditForm({name: e.target.value, phone: editForm.phone})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({name: editForm.name, phone: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Actualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTicket(null)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {separatedNumbers.map((ticket, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-bold text-red-800">Número {ticket.number}</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <p><strong>Nombre:</strong> {ticket.name}</p>
                      <p><strong>Teléfono:</strong> {ticket.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {separatedNumbers.length === 0 && (
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
