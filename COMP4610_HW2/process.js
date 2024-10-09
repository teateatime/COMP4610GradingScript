const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Define paths
const submissionsDir = 'submissions';
const gradingDir = 'grading';
const testFile = 'scripthw2.test.js';

// Helper function to copy files
function copyFileSync(source, destination) {
    fs.copyFileSync(source, destination);
}

// Helper function to run tests
function runTests(studentDir) {
    console.log(`Running tests for ${studentDir}`);
    try {
        const testPath = path.join(__dirname, testFile); // Use __dirname to locate the test file
        const command = `npx jest ${testPath}`;
        console.log(`Executing command: ${command}`);
        child_process.execSync(command, { stdio: 'inherit', cwd: path.join(gradingDir, studentDir) });
        console.log(`Test results for ${studentDir}: successful`);
    } catch (error) {
        console.error(`Error running tests for ${studentDir}:`, error.message);
    }
}

// Helper function to clean up grading directories
function cleanUp(studentDir) {
    console.log(`Cleaning up ${studentDir}`);
    const dirPath = path.join(gradingDir, studentDir);
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}

// Main processing function
function processStudents() {
    const students = ['student1', 'student2'];

    students.forEach(student => {
        console.log(`Processing ${student}`);
        
        // Copy files
        const studentHtmlPath = path.join(submissionsDir, student, 'index.html');
        const studentCssPath = path.join(submissionsDir, student, 'pacific.css');
        const gradingHtmlPath = path.join(gradingDir, student, 'index.html');
        const gradingCssPath = path.join(gradingDir, student, 'pacific.css');
        
        if (!fs.existsSync(path.join(gradingDir, student))) {
            fs.mkdirSync(path.join(gradingDir, student), { recursive: true });
        }
        
        copyFileSync(studentHtmlPath, gradingHtmlPath);
        copyFileSync(studentCssPath, gradingCssPath);
        
        // Run tests
        runTests(student);
        
        // Clean up
        cleanUp(student);
    });
}

// Execute the process
processStudents();
