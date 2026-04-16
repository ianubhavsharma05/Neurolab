import fs from 'fs';

console.log('Generating 6,395 Clinical Medical Records into a SQL Payload. Please wait...');

const firstNames = ['Anubhav', 'Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Isha', 'Diya', 'Riya', 'Aisha', 'Kavya'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Rao', 'Verma'];
const conditionTypes = ['Alzheimer Phase 1', 'MCI Protocol', 'Vascular Sub-Type', 'Stable Baseline', 'Lewy Body Monitor'];
const riskLevels = ['Low', 'Early', 'Critical'];

let sql = `
-- Drop existing table if any
DROP TABLE IF EXISTS patients;

-- Create the patient database table
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    condition TEXT,
    "riskLevel" TEXT,
    status TEXT,
    "lastConsultation" TEXT
);

-- Batch Insert 6,395 Medical Subjects
INSERT INTO patients (id, name, age, gender, condition, "riskLevel", status, "lastConsultation") VALUES
`;

const records = [];

for (let i = 0; i < 6395; i++) {
    const idStr = (i + 1).toString().padStart(4, '0');
    const seed = i * 17;
    const fName = firstNames[seed % firstNames.length];
    const lName = lastNames[(seed * 3) % lastNames.length];
    const risk = riskLevels[seed % riskLevels.length];
    const gender = i % 2 === 0 ? 'M' : 'F';
    const age = 55 + (seed % 35);
    const condition = conditionTypes[seed % conditionTypes.length];
    const status = `Session ${1 + (seed % 12)}/15`;
    const lastConsultation = '2024-12-' + (10 + (seed % 20)).toString().padStart(2, '0');
    
    // Escape single quotes just in case, though none exist in hardcoded lists
    records.push(`('NS-${idStr}', '${fName} ${lName}', ${age}, '${gender}', '${condition}', '${risk}', '${status}', '${lastConsultation}')`);
}

// Join records and terminate the sql statement
sql += records.join(',\n') + ';\n';

fs.writeFileSync('clinical_database_seeder.sql', sql, 'utf8');
console.log('SUCCESS! "clinical_database_seeder.sql" has been created locally.');
