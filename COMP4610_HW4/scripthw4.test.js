const fs = require('fs');
const path = require('path');

// Load the HTML file content
const htmlFilePath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// Test suite for documentation and formatting
describe('Source Code Documentation and Formatting', () => {

  // (1) Test for user name and contact information in the file
  it('should include user name and contact information in the file', () => {
    const nameAndContactRegex = /<!--.*(Name|Contact).*(-->)/i;
    expect(nameAndContactRegex.test(htmlContent)).toBe(true);
  });

  // (1) Test for meaningful documentation and comments that are not code echoes
  it('should contain meaningful explanatory documentation', () => {
    const docCommentRegex = /<!--[^-]*-->/g; // matches comments within the HTML
    const comments = htmlContent.match(docCommentRegex) || [];
    
    // Check if each comment is meaningful (does not merely echo code)
    comments.forEach(comment => {
      const nonEchoCommentRegex = /(describes|explains|usage|purpose|overview)/i;
      expect(nonEchoCommentRegex.test(comment)).toBe(true);
    });
  });

  // (1) Test for proper indentation and formatting
  it('should be properly indented and formatted with adequate white space', () => {
    const lines = htmlContent.split('\n');
    
    lines.forEach(line => {
      const indentation = line.match(/^(\s*)/)[1].length;
      // You can adjust the indentation rules here, for example, checking for 2 spaces
      expect(indentation % 2 === 0).toBe(true);
    });
  });

  // (1) Test for citation of sources used in the code
  it('should contain citations for any external sources used', () => {
    const citationRegex = /<!--.*(source|reference|cite).*-->/i;
    expect(citationRegex.test(htmlContent)).toBe(true);
  });
});
