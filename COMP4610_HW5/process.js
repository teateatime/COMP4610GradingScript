const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const sourceDir = './submissions'; // Directory where student submissions are stored
const destinationDir = './grading'; // Directory where you want to copy the files

// Function to copy files
const copyFiles = (sourceFile, destinationFile) => {
    fs.copyFileSync(sourceFile, destinationFile);
    console.log(`Copied ${sourceFile} to ${destinationFile}`);
};

// Function to iterate through student folders for HW5
const processStudentFolders = (sourcePath, destinationPath) => {
    try {
        const studentFolders = fs.readdirSync(sourcePath, { withFileTypes: true });

        studentFolders.forEach(studentFolder => {
            if (studentFolder.isDirectory()) {
                const studentName = studentFolder.name;
                const studentSourceDir = path.join(sourcePath, studentName);
                const cssFolderPath = path.join(studentSourceDir, 'css');
                const indexHtmlPath = path.join(studentSourceDir, 'index.html');

                // Check if index.html exists
                if (fs.existsSync(indexHtmlPath)) {
                    const styleCssPath = path.join(cssFolderPath, 'style.css');

                    // Check if style.css exists
                    if (fs.existsSync(styleCssPath)) {
                        const destinationStudentFolder = path.join(destinationPath, studentName);
                        const destinationCssFolder = path.join(destinationStudentFolder, 'css');
                        
                        // Create student folder if it doesn't exist
                        if (!fs.existsSync(destinationStudentFolder)) {
                            fs.mkdirSync(destinationStudentFolder, { recursive: true });
                        }
                        
                        // Create css folder if it doesn't exist
                        if (!fs.existsSync(destinationCssFolder)) {
                            fs.mkdirSync(destinationCssFolder, { recursive: true });
                        }

                        // Copy index.html and style.css to destination folder
                        copyFiles(indexHtmlPath, path.join(destinationStudentFolder, 'index.html'));
                        copyFiles(styleCssPath, path.join(destinationCssFolder, 'style.css'));

                        // Run tests for HW5
                        console.log(`Running tests for ${studentName} on HW5`);
                        exec(`npx jest scripthw5.test.js`, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error running tests for ${studentName} on HW5:`, error);
                                return;
                            }
                            console.log(`Test results for ${studentName} on HW5: successful\n`);
                            
                            // Clean up the grading directory after tests
                            fs.rmSync(destinationStudentFolder, { recursive: true, force: true });
                            console.log(`Cleaned up ${destinationStudentFolder}`);
                        });
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error processing student folders:', error);
    }
};

// Main execution
processStudentFolders(sourceDir, destinationDir);
