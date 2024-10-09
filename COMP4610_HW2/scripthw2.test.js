const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Function to get HTML content
function getHtmlContent(htmlFilePath) {
    console.log(`Attempting to read file at: ${htmlFilePath}`);
    if (fs.existsSync(htmlFilePath)) {
        return fs.readFileSync(htmlFilePath, 'utf8');
    } else {
        console.warn(`File not found: ${htmlFilePath}`);
        return null;
    }
}

// Function to get CSS content
function getCssContent(cssFilePath) {
    console.log(`Attempting to read CSS file at: ${cssFilePath}`);
    if (fs.existsSync(cssFilePath)) {
        return fs.readFileSync(cssFilePath, 'utf8');
    } else {
        console.warn(`CSS file not found: ${cssFilePath}`);
        return null;
    }
}

describe('Pacific Trails Resort Page Tests', function() {
    const basePath = '/mnt/c/Users/ttruo/Projects/grading_script/HW2/grading';
    const students = ['student1', 'student2'];

    students.forEach(student => {
        describe(`Pacific Trails Resort Page Tests for ${student}`, function() {
            const htmlFilePath = path.join(basePath, student, 'index.html');
            const cssFilePath = path.join(basePath, student, 'pacific.css');
            console.log(`Running tests for ${student}`);
            console.log(`HTML File Path: ${htmlFilePath}`);
            console.log(`CSS File Path: ${cssFilePath}`);

            const htmlContent = getHtmlContent(htmlFilePath);
            const cssContent = getCssContent(cssFilePath);

            // Skip tests if HTML or CSS file is missing
            if (!htmlContent || !cssContent) {
                console.warn(`Skipping tests for ${student} due to missing HTML or CSS files.`);
                return;
            }

            const dom = new JSDOM(htmlContent, { resources: "usable" });

            // Insert CSS into the DOM
            const styleElement = dom.window.document.createElement('style');
            styleElement.textContent = cssContent;
            dom.window.document.head.appendChild(styleElement);

            // Test for main area width and min-width
            test('should have a main area that is 80% of the page width with a 600px minimum', () => {
                const main = dom.window.document.querySelector('#content');
                const style = dom.window.getComputedStyle(main);

                console.log('Computed Style for #content:', {
                    width: style.width,
                    minWidth: style.minWidth,
                    marginLeft: style.marginLeft,
                    marginRight: style.marginRight
                });

                expect(style.width).toMatch(/80%/);
                expect(style.minWidth).toBe('600px');
                expect(style.marginLeft).toBe('auto');
                expect(style.marginRight).toBe('auto');
            });

            // Test for fixed-width navigation bar
            test('should have a fixed-width navigation bar', () => {
                const nav = dom.window.document.querySelector('nav');
                const style = dom.window.getComputedStyle(nav);

                console.log('Computed Style for nav:', {
                    width: style.width,
                    position: style.position
                });

                expect(style.width).toBe('200px'); // Adjust as necessary
                expect(style.position).toBe('fixed');
            });

            // Test for gradient background
            test('should have a gradient background that stops at the content area', () => {
                const body = dom.window.document.querySelector('body');
                const style = dom.window.getComputedStyle(body);

                console.log('Computed Style for body:', {
                    backgroundImage: style.backgroundImage,
                    backgroundColor: style.backgroundColor
                });

                expect(style.backgroundImage).toContain('url(ptrbackground.jpg)');
                expect(style.backgroundColor).toBe('rgb(0, 86, 159)'); // #00569f
            });

            // Test for special bullet in div#content ul li
            test('should use a special bullet for the list in div#content', () => {
                const listItem = dom.window.document.querySelector('#content ul');
                const style = dom.window.getComputedStyle(listItem);

                console.log('Computed Style for list item in div#content:', {
                    listStyleImage: style.listStyleImage
                });

                // Check if the list-style-image contains the expected bullet image
                expect(style.listStyleImage).toContain('url(marker.gif)');
            });

            // Test for special coloring of the resort name
            test('should apply special coloring to the resort name', () => {
                const resortName = dom.window.document.querySelector('.resort');
                const style = dom.window.getComputedStyle(resortName);
                
                const rgbColor = style.color.match(/\d+/g); // Extract RGB values as an array
                const [r, g, b] = rgbColor.map(Number); // Convert to numbers
                
                console.log('Computed Style for .resort:', {
                    color: style.color,
                    red: r,
                    green: g,
                    blue: b
                });
                
                // Check if the color falls within the desired RGB range
                expect(r).toBeGreaterThanOrEqual(100);
                expect(r).toBeLessThanOrEqual(125);
                expect(g).toBeGreaterThanOrEqual(100);
                expect(g).toBeLessThanOrEqual(140);
                expect(b).toBeGreaterThanOrEqual(150);
                expect(b).toBeLessThanOrEqual(190);
            });

            // Test for no bullets or underlining for navigation links
            test('should have no bullets or underlining for navigation links', () => {
                const links = dom.window.document.querySelectorAll('nav ul');

                links.forEach(link => {
                    const style = dom.window.getComputedStyle(link);

                    console.log('Computed Style for nav link:', {
                        textDecoration: style.textDecoration,
                        listStyle: style.listStyle
                    });

                    expect(style.textDecoration).toBe('none');
                    expect(style.listStyle).toBe('none');
                });
            });
        });
    });
});
