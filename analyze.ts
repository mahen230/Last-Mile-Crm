
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/data/initialMasterData.ts');
const fileContent = fs.readFileSync(filePath, 'utf-8');

// A crude parser for CSV, assuming simple structure
const lines = fileContent.split('\n');
const sector6Houses = new Set<string>();

// Regex to handle CSV with quotes
const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;

lines.slice(3).forEach(line => {
  if (!line.trim()) return;
  const matches = line.match(regex);
  if (matches && matches[5] === '6') { // Column 5 is Sector
    const houseNo = matches[6].replace(/"/g, '').trim();
    if (houseNo) {
      sector6Houses.add(houseNo);
    }
  }
});

console.log('--- Analysis of Sector 6 ---');
console.log('Entries found:', sector6Houses.size);
console.log('List of House Numbers Found:', Array.from(sector6Houses).sort().join(', '));
