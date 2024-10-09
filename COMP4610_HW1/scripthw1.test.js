const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jsdom = require('jsdom');
const cssValidator = require('css-validator');
const { JSDOM } = jsdom;

const gradingDir = path.join(__dirname, 'grading');
const studentFolders = fs.readdirSync(gradingDir, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
const studentFolder = studentFolders[0].name;
const studentDir = path.join(gradingDir, studentFolder);
const cssDir = path.join(studentDir, 'css');
const indexPath = path.join(studentDir, 'index.html');
const cssPath = path.join(cssDir, 'style.css');
const readFileSync = (filePath) => fs.readFileSync(filePath, 'utf-8');

const hasElement = (selector, document) => {
  const body = document.body;
  if (!body) return false;
  return !!body.querySelector(selector);
};

const FormData = require('form-data');

const validateWithW3CService = async (content, type) => {
  const endpoint = type === 'html' ? 'https://validator.w3.org/nu/?out=json' : 'https://jigsaw.w3.org/css-validator/validator';
  try {
    let response;
    if (type === 'html') {
      response = await axios.post(endpoint, content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
      return response.data.messages.length === 0;
    } else if (type === 'css') {
      const form = new FormData();
      form.append('text', content);
      response = await axios.post(endpoint, form, {
        headers: form.getHeaders()
      });

      // Log the full response for debugging
      // console.log('CSS Validation Response:', response.data);

      // Check if validation was successful
      return response.data.cssvalidation.validity === true;
    }

    return false;
  } catch (error) {
    console.error(`Error validating ${type}:`, error.response ? error.response.data : error.message);
    return false;
  }
};

// Read CSS content from file
const cssContent = readFileSync(cssPath);

// Log CSS content to ensure it's correct
// console.log('CSS Content:', cssContent);

// validateWithW3CService(cssContent, 'css').then(isValid => {
//   console.log(`CSS Validation Result: ${isValid ? 'Pass' : 'Fail'}`);
// }).catch(err => {
//   console.error('Failed to validate CSS:', err);
// });

module.exports = validateWithW3CService;

describe('Web Page Elements', () => {
  let dom;

  beforeEach(() => {
    const htmlContent = readFileSync(indexPath);
    dom = new JSDOM(htmlContent);
  });

  test('Headings (h1 to h6 tags)', () => {
    expect(hasElement('h1, h2, h3, h4, h5, h6', dom.window.document)).toBe(true);
  });

  test('Paragraphs', () => {
    expect(hasElement('p', dom.window.document)).toBe(true);
    expect(dom.window.document.querySelectorAll('p').length).toBeGreaterThan(0);
  });

  test('Tables (Used creatively)', () => {
    expect(hasElement('table', dom.window.document)).toBe(true);
  });

  test('Linked Images', () => {
    expect(hasElement('a img', dom.window.document)).toBe(true);
  });

  test('HTML Entities', () => {
    const renderedText = dom.window.document.body.innerHTML;
    console.log('Rendered Text:', renderedText);
    const htmlEntityRegex = /&[a-zA-Z0-9#]+;/;
    const hasEntities = htmlEntityRegex.test(renderedText);
    console.log('Has HTML Entities:', hasEntities);
    expect(hasEntities).toBe(true);
  });

  test('Page validates using W3C Markup Validation Service', async () => {
    const content = readFileSync(indexPath);
    const isValid = await validateWithW3CService(content, 'html');
    expect(isValid).toBe(true);
  });

  // Test for W3C CSS Validator Image
  test('Page validates using using W3C CSS Validator', () => {
    const imageElement = dom.window.document.querySelector('a[href="http://jigsaw.w3.org/css-validator/check/referer"] img[alt="Valid CSS!"]');
    expect(imageElement).not.toBeNull();
    const validSources = [
      'http://jigsaw.w3.org/css-validator/images/vcss',
      'http://jigsaw.w3.org/css-validator/images/vcss-blue'
    ];
    expect(validSources).toContain(imageElement.src);
    expect(imageElement.style.border).toBe('0px');
  });  
});

describe('Web Page Autograder', () => {
  test('Page exhibits creativity and effort', () => {
    const content = readFileSync(indexPath);
    expect(content.length).toBeGreaterThan(5000);
  });

  test('Top of the file documentation and Comments', () => {
    const htmlContent = readFileSync(indexPath);
    const jsFiles = fs.readdirSync(studentDir).filter((file) => file.endsWith('.js'));

    const hasHtmlTopDocumentation = htmlContent.includes('<!--');
    const hasJsTopDocumentation = jsFiles.every((file) => {
      const content = readFileSync(path.join(studentDir, file));
      return content.includes('/*');
    });

    expect(hasHtmlTopDocumentation && hasJsTopDocumentation).toBe(true);
  });
});
