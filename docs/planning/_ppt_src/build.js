// WeatherON 사내 제안 PPT - 빌드 스크립트
const pptxgen = require('pptxgenjs');
const path = require('path');
const { SLIDE_W, SLIDE_H, addCoverSlide, COLORS, FONT_MONO, FONT_BODY } = require('./theme');

const buildSlides01_10 = require('./slides_01_10');
const buildSlides11_20 = require('./slides_11_20');
const buildSlides21_29 = require('./slides_21_29');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WEATHERON_16x9', width: SLIDE_W, height: SLIDE_H });
pptx.layout = 'WEATHERON_16x9';

pptx.author = 'Daehyeon Choi';
pptx.company = 'WeatherON';
pptx.title = 'WeatherON App Product Plan v4.0 - 사내 제안';

buildSlides01_10(pptx);
buildSlides11_20(pptx);
buildSlides21_29(pptx);

const outPath = path.join(__dirname, 'WeatherON_사내제안_v4.pptx');

pptx.writeFile({ fileName: outPath })
  .then(() => {
    console.log('OK', outPath);
  })
  .catch((err) => {
    console.error('BUILD FAILED:', err);
    process.exit(1);
  });
