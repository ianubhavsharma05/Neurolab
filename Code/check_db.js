import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjdodywiyxrbzginvqii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZG9keXdpeXhyYnpnaW52cWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjUzMTgsImV4cCI6MjA4NjEwMTMxOH0.hPg2E5rIAwSwQVeXZZRkNKJ1YMQgdq_U6fik6JLGI4k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log("Checking if 'patients' table exists...");
    const { data, error } = await supabase.from('patients').select('id').limit(1);
    if (error) {
        console.error("Error/Missing Table:", error.message);
    } else {
        console.log("Table exists! Connected to Supabase.", data);
    }
}

checkTable();
