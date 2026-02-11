import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const people = [
  { name: 'Sidney', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T07:05:17.008Z' },
  { name: 'Regina', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T07:05:17.464Z' },
  { name: 'Rodrigo', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Milene', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Caio', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Nicoly', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Lucas', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Carlinhos', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Cristina', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Maria Vitoria', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Beto', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Kauã', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Ana', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Duda', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'João', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Larissa', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Matheus', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Alexandre', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Elaine', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Janaína', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Serlange', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Luiza', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Sérgio', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Shirley', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Luiz', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Sandra', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'William', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Rosa', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Antônio', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Maria Aparecida', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Rebeca', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Eloah', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Membro', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Marcos', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Fabiana', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Davi', amount_paid: 432, total_price: 432, age_group: 'Adulto', person_type: 'Visitante', team_id: 'none', payment_status: 'PAGO', last_payment_date: '2026-02-10T06:56:49.572Z' },
  { name: 'Luna', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Visitante', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Guilherme', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Malu', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Adilson', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Visitante', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Angela', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Visitante', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Enzo', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Carol', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Gilson', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Pamela', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Membro', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null },
  { name: 'Maria', amount_paid: 0, total_price: 432, age_group: 'Jovem', person_type: 'Visitante', team_id: 'none', payment_status: 'PENDENTE', last_payment_date: null }
];

(async () => {
  const { error } = await supabase
    .from('people')
    .insert(people);

  if (error) throw error;
  console.log(`Inserted ${people.length} people rows into people.`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
