// Theme management
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.className = theme;
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.className;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.className = newTheme;
    localStorage.setItem('theme', newTheme);
}

// URL management
let urls = [];
let shortenedUrlsList = [];

function countUrls() {
    const input = document.getElementById('urlInput').value;
    const urlRegex = /https?:\/\/[^\s]+/g;
    urls = input.match(urlRegex) || [];
    const count = urls.length;
    document.getElementById('result').textContent = `Total URLs found: ${count} (${count} tabs)`;

    // Show/hide shorten button
    const shortenButton = document.getElementById('shortenButton');
    if (count > 0) {
        shortenButton.classList.remove('hidden');
    } else {
        shortenButton.classList.add('hidden');
    }
}

async function shortenUrls() {
    const shortenedResult = document.getElementById('shortenedResult');
    shortenedResult.innerHTML = '<p class="text-gray-400">Shortening URLs...</p>';
    document.getElementById('copyButton').classList.add('hidden');

    try {
        shortenedUrlsList = await Promise.all(
            urls.map(async (url) => {
                const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error('Failed to shorten URL');
                return await response.text();
            })
        );

        // Display results
        shortenedResult.innerHTML = `
            <p class="text-gray-100 font-semibold mb-2">Shortened URLs (${shortenedUrlsList.length} links):</p>
            <ul class="list-disc list-inside">
                ${shortenedUrlsList.map((shortUrl) => `<li><a href="${shortUrl}" target="_blank" class="text-blue-400 hover:underline">${shortUrl}</a></li>`).join('')}
            </ul>
        `;
        document.getElementById('copyButton').classList.remove('hidden');
    } catch (error) {
        shortenedResult.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
    }
}

async function copyAllLinks() {
    if (shortenedUrlsList.length === 0) return;
    
    try {
        const textToCopy = shortenedUrlsList.join('\n');
        await navigator.clipboard.writeText(textToCopy);
        
        // Visual feedback
        const copyButton = document.getElementById('copyButton');
        copyButton.textContent = 'Copied!';
        copyButton.classList.remove('bg-purple-500', 'hover:bg-purple-600');
        copyButton.classList.add('bg-green-500', 'hover:bg-green-600');
        
        setTimeout(() => {
            copyButton.textContent = 'Copy All Links';
            copyButton.classList.remove('bg-green-500', 'hover:bg-green-600');
            copyButton.classList.add('bg-purple-500', 'hover:bg-purple-600');
        }, 2000);
    } catch (error) {
        alert('Failed to copy links: ' + error.message);
    }
}

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', initTheme); 