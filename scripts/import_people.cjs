const { Client } = require('pg');

const connectionString = process.env.PG_CONN;
if (!connectionString) {
  console.error('PG_CONN env var not set');
  process.exit(1);
}

const people = [
  { id: 'p-0-1770706609572', name: 'Sidney', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T07:05:17.008Z' },
  { id: 'p-1-1770706609572', name: 'Regina', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T07:05:17.464Z' },
  { id: 'p-2-1770706609572', name: 'Rodrigo', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-3-1770706609572', name: 'Milene', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-4-1770706609572', name: 'Caio', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-5-1770706609572', name: 'Nicoly', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-6-1770706609572', name: 'Lucas', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-7-1770706609572', name: 'Carlinhos', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-8-1770706609572', name: 'Cristina', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-9-1770706609572', name: 'Maria Vitoria', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-10-1770706609572', name: 'Beto', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-11-1770706609572', name: 'Kauã', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-12-1770706609572', name: 'Ana', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-13-1770706609572', name: 'Duda', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-14-1770706609572', name: 'João', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-15-1770706609572', name: 'Larissa', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-16-1770706609572', name: 'Matheus', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-17-1770706609572', name: 'Alexandre', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-18-1770706609572', name: 'Elaine', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-19-1770706609572', name: 'Janaína', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-20-1770706609572', name: 'Serlange', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-21-1770706609572', name: 'Luiza', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-22-1770706609572', name: 'Sérgio', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-23-1770706609572', name: 'Shirley', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-24-1770706609572', name: 'Luiz', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-25-1770706609572', name: 'Sandra', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-26-1770706609572', name: 'William', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-27-1770706609572', name: 'Rosa', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-28-1770706609572', name: 'Antônio', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-29-1770706609572', name: 'Maria Aparecida', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-30-1770706609572', name: 'Rebeca', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-31-1770706609572', name: 'Eloah', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-32-1770706609572', name: 'Marcos', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-33-1770706609572', name: 'Fabiana', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-34-1770706609572', name: 'Davi', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Visitante', teamId: 'none', paymentStatus: 'PAGO', lastPaymentDate: '2026-02-10T06:56:49.572Z' },
  { id: 'p-35-1770706609572', name: 'Luna', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Visitante', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-36-1770706609572', name: 'Guilherme', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-37-1770706609572', name: 'Malu', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-38-1770706609572', name: 'Adilson', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Visitante', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-39-1770706609572', name: 'Angela', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Visitante', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-40-1770706609572', name: 'Enzo', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-41-1770706609572', name: 'Carol', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-42-1770706609572', name: 'Gilson', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-43-1770706609572', name: 'Pamela', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null },
  { id: 'p-44-1770706609572', name: 'Maria', amountPaid: 0, totalPrice: 432, ageGroup: 'Jovem', personType: 'Visitante', teamId: 'none', paymentStatus: 'PENDENTE', lastPaymentDate: null }
];

const toSnake = {
  amountPaid: 'amount_paid',
  totalPrice: 'total_price',
  ageGroup: 'age_group',
  personType: 'person_type',
  teamId: 'team_id',
  paymentStatus: 'payment_status',
  lastPaymentDate: 'last_payment_date'
};

(async () => {
  const client = new Client({ connectionString });
  await client.connect();

  const { rows } = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='people'"
  );
  const columns = rows.map(r => r.column_name);

  const useSnake = columns.includes('amount_paid');
  const cols = ['id', 'name', 'amountPaid', 'totalPrice', 'ageGroup', 'personType', 'teamId', 'paymentStatus', 'lastPaymentDate'];
  const dbCols = cols.map(c => (useSnake ? (toSnake[c] || c) : c));

  const values = [];
  const placeholders = [];
  let idx = 1;
  for (const p of people) {
    values.push(
      p.id,
      p.name,
      p.amountPaid,
      p.totalPrice,
      p.ageGroup,
      p.personType,
      p.teamId,
      p.paymentStatus,
      p.lastPaymentDate
    );
    const rowPlaceholders = [];
    for (let i = 0; i < cols.length; i++) {
      rowPlaceholders.push(`$${idx++}`);
    }
    placeholders.push(`(${rowPlaceholders.join(',')})`);
  }

  const updates = dbCols
    .filter(c => c !== 'id')
    .map(c => `${c} = EXCLUDED.${c}`)
    .join(', ');

  const sql = `INSERT INTO people (${dbCols.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT (id) DO UPDATE SET ${updates};`;

  await client.query(sql, values);
  console.log(`Upserted ${people.length} people rows into people.`);

  await client.end();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
