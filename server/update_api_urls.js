const fs = require('fs');
const path = require('path');

// Function to update hardcoded localhost URLs to relative URLs
function updateApiUrls(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace all instances of http://localhost:5000/api with /api
        const updatedContent = content.replace(/http:\/\/localhost:5000\/api/g, '/api');
        
        // Only write if changes were made
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✓ Updated: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Recursively find all .jsx and .js files in the src directory
function findJsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules')) {
            findJsxFiles(filePath, fileList);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'client', 'src');
const jsxFiles = findJsxFiles(srcDir);

console.log('Updating API URLs in frontend files...');
console.log(`Found ${jsxFiles.length} files to check`);

let updatedCount = 0;
jsxFiles.forEach(file => {
    if (updateApiUrls(file)) {
        updatedCount++;
    }
});

console.log(`\n✅ Updated ${updatedCount} files with API URL changes`);
console.log('All hardcoded localhost:5000 URLs have been converted to relative URLs');
