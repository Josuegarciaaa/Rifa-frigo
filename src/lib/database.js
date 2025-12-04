import PocketBase from 'pocketbase';

const pb = new PocketBase('https://rifas-frigo.pockethost.io/');

let isSaving = false;

// Cache para reducir llamadas a la BD
let cache = {
  separatedNumbers: null,
  lastFetch: null,
  cacheDuration: 5000 // 5 segundos
};

const isCacheValid = () => {
  return cache.separatedNumbers !== null && 
         cache.lastFetch !== null && 
         (Date.now() - cache.lastFetch) < cache.cacheDuration;
};

const get = async (key, forceRefresh = false) => {

  if (key === 'selectedNumbers') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  }

  // -----------------------------------------
  // OBTENER SEPARADOS/VENDIDOS (con caché)
  // -----------------------------------------
  else if (key === 'separatedNumbers' || key === 'soldNumbers') {
    
    // Usar caché si es válido y no se fuerza refresh
    if (!forceRefresh && isCacheValid()) {
      console.log('Usando caché para', key);
      return cache.separatedNumbers;
    }

    try {
      console.log('Consultando PocketBase para', key);
      
      // Optimizaciones:
      // 1. Usar perPage en lugar de getFullList para controlar la carga
      // 2. Ordenar en el servidor
      // 3. Seleccionar solo campos necesarios
      const records = await pb.collection('tickets').getList(1, 500, {
        filter: 'vendido=true',
        sort: 'num__boleto',
        fields: 'id,num__boleto,nombre,telefono',
        requestKey: 'get-tickets' // Cancelar requests duplicados
      });

      const result = records.items.map(record => ({
        number: parseInt(record.num__boleto),
        name: record.nombre,
        phone: record.telefono || '',
        id: record.id
      }));

      // Actualizar caché
      cache.separatedNumbers = result;
      cache.lastFetch = Date.now();

      return result;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error reading from PocketBase:', error);
      }
      // Si hay error pero tenemos caché, devolverlo
      return cache.separatedNumbers || [];
    }
  }

  return null;
};

// ====================================================
// GUARDAR / CREAR / ACTUALIZAR TICKET
// ====================================================
const set = async (key, value) => {

  if (isSaving) {
    console.log('Save already in progress, skipping');
    return;
  }

  isSaving = true;

  try {

    // -----------------------------------------
    // GUARDAR EN LOCAL
    // -----------------------------------------
    if (key === 'selectedNumbers') {
      localStorage.setItem(key, JSON.stringify(value));
    }

    // -----------------------------------------
    // GUARDAR EN POCKETBASE (optimizado)
    // -----------------------------------------
    else if (key === 'separatedNumbers') {

      console.log('Saving separatedNumbers to PocketBase:', value);

      // Procesar tickets en paralelo (máximo 5 a la vez)
      const batchSize = 5;
      for (let i = 0; i < value.length; i += batchSize) {
        const batch = value.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (ticket) => {
          try {
            // Buscar si ya existe (optimizado con requestKey único)
            let existing = null;
            try {
              existing = await pb.collection('tickets').getFirstListItem(
                `num__boleto=${ticket.number}`,
                { 
                  requestKey: `check-${ticket.number}`,
                  fields: 'id' // Solo necesitamos el ID
                }
              );
            } catch (_) {
              existing = null;
            }

            const ticketData = {
              nombre: ticket.name,
              telefono: ticket.phone || '',
              vendido: true,
              fecha: new Date().toISOString()
            };

            if (existing) {
              await pb.collection('tickets').update(existing.id, ticketData);
            } else {
              await pb.collection('tickets').create({
                ...ticketData,
                num__boleto: ticket.number
              });
            }

          } catch (error) {
            console.error('Error saving ticket:', error);
          }
        }));
      }

      // Invalidar caché después de guardar
      cache.separatedNumbers = null;
      cache.lastFetch = null;
    }

  } catch (error) {
    console.error('Error writing to PocketBase:', error);
  } finally {
    isSaving = false;
  }
};

const updateSeparatedTicket = async (ticket) => {
  try {
    await pb.collection('tickets').update(ticket.id, {
      nombre: ticket.name,
      telefono: ticket.phone,
      fecha: new Date().toISOString()
    });
    
    // Invalidar caché
    cache.separatedNumbers = null;
    cache.lastFetch = null;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

const deleteSeparatedTicket = async (id) => {
  try {
    await pb.collection('tickets').delete(id);
    
    // Invalidar caché
    cache.separatedNumbers = null;
    cache.lastFetch = null;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};

// Función helper para forzar refresh del caché
const refreshCache = async () => {
  return await get('separatedNumbers', true);
};

const database = { 
  get, 
  set, 
  updateSeparatedTicket, 
  deleteSeparatedTicket,
  refreshCache 
};

export default database;