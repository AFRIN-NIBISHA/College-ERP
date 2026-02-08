const fs = require('fs');
try {
    const raw = fs.readFileSync('students_all.json');
    let content = '';
    if (raw[0] === 0xFF && raw[1] === 0xFE) {
        content = raw.toString('utf16le');
    } else {
        content = raw.toString('utf8');
    }

    // Find the first [ that is followed by { (to start the array of objects)
    const jsonStart = content.indexOf('[{');
    if (jsonStart !== -1) {
        content = content.substring(jsonStart);
    } else {
        const simpleStart = content.indexOf('[');
        if (simpleStart !== -1) content = content.substring(simpleStart);
    }

    // Clean up end of string if needed
    const lastBracket = content.lastIndexOf(']');
    if (lastBracket !== -1) {
        content = content.substring(0, lastBracket + 1);
    }

    const students = JSON.parse(content);
    const filtered = students.filter(s => s.name && s.name.toLowerCase().includes('afrin'));
    console.log(JSON.stringify(filtered, null, 2));
} catch (err) {
    console.error("Error:", err.message);
}
