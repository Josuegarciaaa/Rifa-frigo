import PocketBase from 'pocketbase';

const pb = new PocketBase('https://rifas-frigo.pockethost.io/');

let isSaving = false;

const get = async (key) => {

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
  // OBTENER SEPARADOS (vendidos)
  // -----------------------------------------
  else if (key === 'separatedNumbers') {
    try {
      const records = await pb.collection('tickets').getFullList({
        filter: 'vendido=true'   // filtro boolean correcto
      });

      return records.map(record => ({
        number: parseInt(record.num__boleto),
        name: record.nombre,
        phone: record.telefono || '',
        id: record.id
      }));

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error reading from PocketBase:', error);
      }
      return [];
    }
  }

  // -----------------------------------------
  // OBTENER SOLO VENDIDOS
  // -----------------------------------------
  else if (key === 'soldNumbers') {
    try {
      const records = await pb.collection('tickets').getFullList({
        filter: 'vendido=true'
      });

      return records.map(record => ({
        number: parseInt(record.num__boleto),
        name: record.nombre,
        phone: record.telefono || '',
        id: record.id
      }));

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error reading from PocketBase:', error);
      }
      return [];
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
    // GUARDAR EN POCKETBASE
    // -----------------------------------------
    else if (key === 'separatedNumbers') {

      console.log('Saving separatedNumbers to PocketBase:', value);

      for (const ticket of value) {
        try {
          // buscar si ya existe el boleto
          let existing = null;
          try {
            existing = await pb.collection('tickets').getFirstListItem(
              `num__boleto=${ticket.number}`,
              { requestKey: null }
            );
          } catch (_) {
            existing = null;
          }

          if (existing) {
            // actualizar registro existente
            console.log('Updating existing ticket:', existing.id);
            await pb.collection('tickets').update(existing.id, {
              nombre: ticket.name,
              telefono: ticket.phone || '',
              vendido: true,
              fecha: new Date().toISOString()
            });
          } else {
            // crear nuevo registro
            console.log('Creating new ticket:', ticket);
            await pb.collection('tickets').create({
              nombre: ticket.name,
              num__boleto: ticket.number,
              telefono: ticket.phone || '',
              vendido: true,
              fecha: new Date().toISOString()
            });
          }

        } catch (error) {
          console.error('Error saving ticket:', error);
        }
      }
    }

  } catch (error) {
    console.error('Error writing to PocketBase:', error);
  }

  finally {
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
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

const deleteSeparatedTicket = async (id) => {
  try {
    await pb.collection('tickets').delete(id);
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};

const database = { get, set, updateSeparatedTicket, deleteSeparatedTicket };
export default database;
