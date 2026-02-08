const fs = require('fs');
try {
    const raw = fs.readFileSync('students_all.json');
    let content = '';
    if (raw[0] === 0xFF && raw[1] === 0xFE) {
        content = raw.toString('utf16le');
    } else {
        content = raw.toString('utf8');
    }
    // Remove potential stray characters at start
    const jsonStart = content.indexOf('[');
    if (jsonStart !== -1) {
        content = content.substring(jsonStart);
    }
    const students = JSON.parse(content);
    const filtered = students.filter(s => s.name && s.name.toLowerCase().includes('afrin'));
    console.log(JSON.stringify(filtered, null, 2));
} catch (err) {
    console.error(err.message);
}
