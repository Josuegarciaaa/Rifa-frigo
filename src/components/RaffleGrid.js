import React, { useState, useMemo } from 'react';

const RaffleGrid = ({ selectedNumbers, separatedNumbers, soldNumbers, onNumberSelect, onSeparateTickets, totalTickets, totalPrice }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNumbersToSeparate, setSelectedNumbersToSeparate] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [phoneError, setPhoneError] = useState('');

  const numbers = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Número de tarjeta copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const toggleNumberSelection = (number) => {
    setSelectedNumbersToSeparate(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const handleSeparateSelected = () => {
    if (selectedNumbersToSeparate.length > 0) {
      setShowModal(true);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone && validatePhone(formData.phone) && selectedNumbersToSeparate.length > 0) {
      onSeparateTickets(selectedNumbersToSeparate, formData);
      setShowModal(false);
      setFormData({ name: '', phone: '' });
      setSelectedNumbersToSeparate([]);
      setPhoneError('');
    } else if (!validatePhone(formData.phone)) {
      setPhoneError('El número de teléfono debe ser numérico y tener exactamente 10 dígitos.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({ name: '', phone: '' });
    setSelectedNumbersToSeparate([]);
    setPhoneError('');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-opacity-95 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-4 border-orange-400 border-opacity-70 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-center text-white mb-6 sm:mb-8 drop-shadow-2xl">
             🎫 Separa tus números 🎫
          </h2>
        </div>

        {/* Payment Instructions */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-opacity-30 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-yellow-300 border-opacity-50">
          <h3 className="text-lg sm:text-xl font-bold text-yellow-100 mb-4">📋 Instrucciones para separar boletos:</h3>
          <div className="text-sm sm:text-base text-white space-y-2">
            <p><strong>1️⃣</strong> Haz clic en los números que deseas seleccionar (se marcarán en azul)</p>
            <p><strong>2️⃣</strong> Presiona el botón "✂️ Separar Seleccionados" que aparecerá abajo</p>
            <p><strong>3️⃣</strong> Completa tus datos (nombre y teléfono)</p>
            <p><strong>4️⃣</strong> Realiza el pago de $50 por boleto a:</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-3 border border-white border-opacity-30">
              <p><strong>💳 Tarjeta:</strong> 4910897092374420 (HSBC) <button onClick={() => copyToClipboard('4910897092374420')} className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">📋 Copiar</button></p>
              <p><strong>👤 Nombre:</strong> Josue Francisco Garcia Cepeda</p>
              <p><strong>📝 Concepto:</strong> numero separado</p>
            </div>
            <p><strong>5️⃣</strong> Al separar el boleto se te enviará automáticamente a WhatsApp para confirmar la compra. Si no abre, favor de enviar comprobante al número 8442818979</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          {numbers.map((number) => {
            const quantity = selectedNumbers[number] || 0;
            const isSeparated = separatedNumbers.some(ticket => ticket.number === number);
            const isSold = soldNumbers.some(ticket => ticket.number === number);
            const isSelected = quantity > 0;
            const isSelectedForSeparation = selectedNumbersToSeparate.includes(number);

            return (
              <div
                key={number}
                className={`relative p-2 sm:p-3 lg:p-4 border-2 rounded-lg transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 shadow-xl'
                    : isSeparated || isSold
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-xl cursor-not-allowed'
                    : isSelectedForSeparation && showModal
                    ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white border-gray-400 shadow-xl'
                    : isSelectedForSeparation
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-xl'
                    : 'bg-white bg-opacity-90 text-gray-800 border-gray-300 hover:border-orange-300 hover:shadow-lg cursor-pointer'
                }`}
                onClick={() => !isSelected && !isSeparated && !isSold && !showModal && toggleNumberSelection(number)}
              >
                <div className="text-center font-bold text-sm sm:text-base lg:text-lg mb-2">
                  {number}
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    {quantity}
                  </div>
                )}
                {isSelectedForSeparation && !isSelected && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    ✓
                  </div>
                )}

              </div>
            );
          })}
        </div>
        <div className="text-center bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-white border-opacity-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-500 bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-blue-200">Boletos separados</p>
              <p className="text-2xl font-bold text-blue-300">{totalTickets + selectedNumbersToSeparate.length}</p>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-green-200">Total a pagar</p>
              <p className="text-2xl font-bold text-green-300">${totalPrice + selectedNumbersToSeparate.length * 50}</p>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-purple-200">Boletos disponibles</p>
              <p className="text-2xl font-bold text-purple-300">{100 - separatedNumbers.length - soldNumbers.length - selectedNumbersToSeparate.length}</p>
            </div>
          </div>
          {selectedNumbersToSeparate.length > 0 && (
            <div className="mt-4">
              <p className="text-white mb-2">Números seleccionados: {selectedNumbersToSeparate.join(', ')}</p>
              <button
                onClick={handleSeparateSelected}
                className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-xl transform hover:scale-105"
              >
                ✂️ Separar Seleccionados ({selectedNumbersToSeparate.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for separating tickets */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Separar Boletos #{selectedNumbersToSeparate.join(', ')}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu nombre completo"
                  style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de celular *
                </label>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (phoneError) setPhoneError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu número de celular (10 dígitos)"
                  style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
                />
                {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p className="font-semibold mb-1"> Datos de pago:</p>
                <p>Tarjeta: 4910897092374420 (HSBC)</p>
                <p>Nombre: Josue Francisco Garcia Cepeda</p>
                <p>Concepto: numero separado</p>
                <p className="mt-2 font-semibold">Monto: ${selectedNumbersToSeparate.length * 50}</p>
                <p className="mt-2 text-red-600 font-semibold"> IMPORTANTE: Favor de enviar el comprobante de pago antes de 48 horas de haber separado el boleto, de lo contrario se volverá a marcar como disponible.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Separar Boletos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RaffleGrid;
