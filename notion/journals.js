/**
 * JavaScript file for dynamically loading and displaying journal data
 * Reads from journals.json and creates SCImago journal links and images
 */

// DOM elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const journalsContainer = document.getElementById('journals-container');

/**
 * Create a journal item element with link and image
 * @param {string} name - Journal name
 * @param {string} code - Journal code
 * @returns {HTMLElement} - The journal item element
 */
function createJournalItem(name, code) {
    // Create the main container
    const journalItem = document.createElement('div');
    journalItem.className = 'journal-item';
    
    // Create the link element
    const link = document.createElement('a');
    link.href = `https://www.scimagojr.com/journalsearch.php?q=${code}&tip=sid&exact=no`;
    link.title = `SCImago Journal & Country Rank - ${name}`;
    link.target = '_blank'; // Open in new tab
    
    // Create the image element
    const img = document.createElement('img');
    img.src = `https://www.scimagojr.com/journal_img.php?id=${code}`;
    img.alt = `SCImago Journal & Country Rank - ${name}`;
    img.border = '0';
    
    // Handle image loading errors
    img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkIi8+CiAgPHRleHQgeD0iMTAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
        this.alt = `Image not available for ${name}`;
    };
    
    // Create journal name element
    const nameElement = document.createElement('div');
    nameElement.className = 'journal-name';
    nameElement.textContent = name;
    
    // Create journal code element
    const codeElement = document.createElement('div');
    codeElement.className = 'journal-code';
    codeElement.textContent = `Code: ${code}`;
    
    // Assemble the elements (only link with image, no text)
    link.appendChild(img);
    journalItem.appendChild(link);
    // journalItem.appendChild(nameElement);  // Removed
    // journalItem.appendChild(codeElement);  // Removed
    
    return journalItem;
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    errorElement.textContent = message;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingElement.style.display = 'none';
}

/**
 * Process journal data and create DOM elements
 * @param {Array} journals - Array of journal objects
 */
function displayJournals(journals) {
    hideLoading();
    
    if (!journals || journals.length === 0) {
        showError('No journals found in the data.');
        return;
    }
    
    // Clear any existing content
    journalsContainer.innerHTML = '';
    
    // Create and append journal items
    journals.forEach(journal => {
        const journalItem = createJournalItem(journal.name, journal.code);
        journalsContainer.appendChild(journalItem);
    });
    
    console.log(`Successfully loaded ${journals.length} journals`);
}

/**
 * Parse journal data from the JSON structure
 * @param {Object} data - Raw JSON data
 * @returns {Array} - Array of journal objects with name and code
 */
function parseJournalData(data) {
    if (!data || !data.journals) {
        throw new Error('Invalid JSON structure: missing "journals" array');
    }
    
    const journals = [];
    data.journals.forEach(journalObj => {
        // Each journal object has name as key and code as value
        for (const [name, code] of Object.entries(journalObj)) {
            journals.push({ name, code });
        }
    });
    
    return journals;
}

/**
 * Load journal data from JSON file
 */
async function loadJournals() {
    try {
        const response = await fetch('journals.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const journals = parseJournalData(data);
        displayJournals(journals);
        
    } catch (error) {
        console.error('Error loading journals:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Unable to load journals.json. Make sure the file exists and the page is served from a web server.');
        } else {
            showError(`Error loading journals: ${error.message}`);
        }
    }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Journals page loaded, fetching data...');
    loadJournals();
});

// For debugging - expose functions to global scope
window.journalsApp = {
    loadJournals,
    displayJournals,
    parseJournalData
};
