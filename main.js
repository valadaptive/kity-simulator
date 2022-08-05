const kityFillImg = document.createElement('img');
kityFillImg.src = 'kity fill.png';
const waitForKityFill = new Promise(resolve => {
    kityFillImg.onload = () => {
        resolve();
    }
});

const kityLineImg = document.createElement('img');
kityLineImg.src = 'kity line.png';
const waitForKityLine = new Promise(resolve => {
    kityLineImg.onload = () => {
        resolve();
    }
});

const memo = new Map();
const generateKity = async color => {
    const memoized = memo.get(color);
    if (memoized) return memoized;
    await Promise.all([waitForKityFill, waitForKityLine]);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = kityFillImg.naturalWidth;
    canvas.height = kityFillImg.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(kityFillImg, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(kityLineImg, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    return URL.createObjectURL(blob);
}

const addKity = (kitties) => {
    const kityTravelTime = Math.random() * 500 + 1500;
    const kity = document.createElement('img');
    kity.className = 'kity';
    kity.src = kitties[Math.floor(Math.random() * kitties.length)];

    const startTime = performance.now();
    const horizontalVelocity = (Math.random() - 0.5) * 100;
    const horizontalOffset = (Math.random() * 0.5) + 0.25;
    const verticalVelocity = (Math.random() * 0.25) + 0.675;
    const moveKity = () => {
        const t = (performance.now() - startTime) / kityTravelTime;
        kity.style.transform = `translateY(${(0.25 - ((0.5 - t) ** 2)) * -4 * verticalVelocity * 100}vh) translateX(calc(${t * horizontalVelocity + (horizontalOffset * 100)}vw - 50%)) rotate(${(t - 0.5) * horizontalVelocity * 10}deg) `;
        if (t < 1) window.requestAnimationFrame(moveKity);
    }
    moveKity();

    document.body.appendChild(kity);
    window.setTimeout(() => {
        kity.remove();
    }, kityTravelTime);
}

const audioContext = new window.AudioContext();
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.75;
gainNode.connect(audioContext.destination);

const soundCounts = {
    meow: 9,
    boing: 8,
    nya: 3
};

const playSound = buf => {
    const node = audioContext.createBufferSource();
    node.buffer = buf;
    node.connect(gainNode);
    node.start();
}

const main = async () => {
    const kitties = await Promise.all(['#e09938', '#bab7b2', '#825f46', '#3a3733', '#e8701c'].map(color => generateKity(color)));

    const soundFilenames = [];
    for (const soundName of Object.keys(soundCounts)) {
        for (let i = 1; i <= soundCounts[soundName]; i++) {
            soundFilenames.push(`${soundName}${i}.ogg`);
        }
    }
    console.log(soundFilenames);
    const soundBuffers = await Promise.all(soundFilenames.map(async filename => {
        const data = await fetch(filename).then(response => response.arrayBuffer());
        console.log(data);
        return new Promise((resolve, reject) => audioContext.decodeAudioData(data, resolve, reject));
    }));
    console.log(soundBuffers);

    window.setInterval(() => {
        addKity(kitties);
        playSound(soundBuffers[Math.floor(Math.random() * soundBuffers.length)]);
    }, 1000);
    addKity(kitties);
    playSound(soundBuffers[Math.floor(Math.random() * soundBuffers.length)]);
}

main();