//APPLICATION?edufile.imagegenerator/v2.1(#edufile7.0.0525)
const API_KEY = "AIzaSyBbYhWT3mPrlokAIUTgraXwEeT9bAY2Aus";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${API_KEY}`;


function useExamplePrompt(promptText) {
    const promptInput = document.getElementById('promptInput');
    promptInput.value = promptText;
    promptInput.focus();

    promptInput.classList.add('prompt-highlight');
    setTimeout(() => {
        promptInput.classList.remove('prompt-highlight');
    }, 600);
}

function showError(message) {
    const errorElement = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');

    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 2000);
}

function clearError() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.classList.add('hidden');
}

function getPaddingBottom(aspectRatio) {
    const [width, height] = aspectRatio.split(':').map(Number);
    return `${(height / width) * 100}%`;
}

async function generateImages() {
    const prompt = document.getElementById('promptInput').value.trim();
    const aspectRatio = document.getElementById('aspectRatio').value;
    const imagesCount = parseInt(document.getElementById('imageCount').value);
    const loader = document.getElementById('loader');
    const output = document.getElementById('output');

    clearError();

    if (!prompt) {
        showError('Сұранысты енгізіңіз.');
        return;
    }

    loader.classList.remove('hidden');
    output.innerHTML = '';
    output.classList.add('hidden');

    const body = {
        contents: [{
            parts: [{
                text: `${prompt}. Please generate image with aspect ratio ${aspectRatio}.`,
            }],
        }],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    };

    try {
        for (let i = 0; i < imagesCount; i++) {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error(`Сервер осылай жауап берді: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            const base64Image = data?.candidates?.[0]?.content?.parts?.find(
                (p) => p.inlineData
            )?.inlineData?.data;

            if (!base64Image) {
                throw new Error('Жауапта сурет деректері табылмады.');
            }

            const container = document.createElement('div');
            container.className = 'image-container';
            container.style.paddingBottom = getPaddingBottom(aspectRatio);

            const img = document.createElement('img');
            img.src = `data:image/png;base64,${base64Image}`;
            img.alt = `Генерацияланған сурет ${i + 1}`;
            img.loading = 'lazy';
            img.className = 'generated-image';

            const downloadLink = document.createElement('a');
            downloadLink.href = img.src;
            downloadLink.download = `генерацияланған сурет-${i + 1}.png`;
            downloadLink.className = 'download-link';
            downloadLink.title = 'Суретті жүктеу';
            downloadLink.innerHTML = `<i class="fa-solid fa-download"></i>`;

            container.appendChild(img);
            container.appendChild(downloadLink);
            output.appendChild(container);
        }
        output.classList.remove('hidden');

    } catch (error) {
        console.error('Суретті генерациялау қатесі:', error);
        showError(`Суретті генерациялау мүмкін болмады. Қайталап көріңіз. ${error.message}`);
    } finally {
        loader.classList.add('hidden');
    }
}