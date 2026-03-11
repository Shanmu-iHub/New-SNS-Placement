const url = "https://drive.google.com/file/d/1rxe_Ff9vGmuboVzPvj6quFWEMVVgHPcc/view?usp=sharing";
const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
console.log(driveMatch[1]);
console.log(`https://drive.google.com/uc?export=view&id=${driveMatch[1]}`);
