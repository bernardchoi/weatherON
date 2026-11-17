const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

function load(file, imports = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('module', 'exports', 'require', source)(module, module.exports, name => {
    if (name.endsWith('.png')) return name;
    assert.ok(name in imports, `unexpected native boundary: ${name}`);
    return imports[name];
  });
  return module.exports;
}
const jsx = (type, props, ...children) => ({ type, props: { ...props, children } });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree)
  ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
let dimensions = { width: 390, height: 844, fontScale: 1 }, language = 'ko', dark = false;
const theme = () => dark ? { text: '#fff', muted: '#ccc', border: '#666', card: '#123' }
  : { text: '#123', muted: '#456', border: '#abc', card: '#fff' };
const model = load('apps/mobile/src/state/profileCharacter.ts');
const localePolicy = load('apps/mobile/src/localization/localePolicy.ts');
const expectedNames = {
  ko: ['기본', '온비', '솔라', '레인', '스톰', '윈드', '프로스트', '미스트'],
  en: ['Default', 'ONBY', 'Solar', 'Rain', 'Storm', 'Wind', 'Frost', 'Mist'],
  ja: ['標準', 'オンビ', 'ソーラー', 'レイン', 'ストーム', 'ウィンド', 'フロスト', 'ミスト'],
};
const presentation = load('apps/mobile/src/utils/profileCharacterPresentation.ts');
const picker = load('apps/mobile/src/components/ProfileCharacterPicker.tsx', {
  react: { createElement: jsx, use: () => ({ language }) },
  '../ambientAssets': { ambientUiIcons: { tabMy: 'person' } },
  '../localization/react-native': { ActivityIndicator: 'Spinner', Image: 'Image', Modal: 'Modal', ScrollView: 'ScrollView', Text: 'Text', View: 'View', useWindowDimensions: () => dimensions },
  './FeedbackPressable': { FeedbackPressable: 'Button' },
  '../theme/AppThemeContext': { useAppTheme: theme },
  '../localization/LocalizationProvider': { LocalizationContext: {} },
  '../state/profileCharacterPersistence': {},
  '../state/profileCharacter': model,
  '../utils/profileCharacterPresentation': presentation,
});

async function main() {
  assert.deepEqual(model.profileCharacterIds, ['default', 'main', 'solar', 'rain', 'storm', 'wind', 'frost', 'mist']);
  assert.equal(model.profileCharacterStorageKey, 'weatheron.profile-character.v1');
  for (const id of model.profileCharacterIds) {
    assert.deepEqual(model.profileCharacterRecord(id), { version: 1, id });
    assert.equal(model.normalizeProfileCharacter(JSON.parse(JSON.stringify({ version: 1, id }))), id);
  }
  const localeCases = [
    [[{ languageCode: 'ko', languageTag: 'ko-KR' }], 'ko'],
    [[{ languageCode: 'en', languageTag: 'en-US' }], 'en'],
    [[{ languageCode: 'ja', languageTag: 'ja-JP' }], 'ja'],
    [[{ languageTag: 'ko_KR' }], 'ko'],
    [[{ languageTag: 'en-KR', regionCode: 'KR' }], 'en'],
    [[{ languageTag: 'ja-US', regionCode: 'US' }], 'ja'],
    [[{ languageTag: 'zh-CN' }, { languageTag: 'ja-JP' }, { languageTag: 'ko-KR' }], 'ja'],
    [[{ languageTag: 'fr-FR' }, { languageTag: 'ko-KR' }, { languageTag: 'en-US' }], 'ko'],
    [[{ languageTag: 'en-US' }, { languageTag: 'ko-KR' }], 'en'],
    [[{ languageTag: 'zh-CN' }, { languageTag: 'fr-FR' }], 'en'],
    [[{}], 'en'],
    [[], 'en'],
  ];
  for (const [locales, expectedLanguage] of localeCases) {
    language = localePolicy.resolveLocalePolicy(locales).language;
    assert.equal(language, expectedLanguage);
    const t = picker.useProfileCharacterCopy();
    const tree = nodes(picker.ProfileCharacterPicker({ visible: true, onClose() {}, state: { id: 'main', ready: true, error: false, saving: false, select() {} } }));
    const cards = tree.filter(n => n.props.testID?.startsWith('profile-character-'));
    assert.deepEqual(cards.map(card => card.props.accessibilityLabel), expectedNames[language]);
    for (const [index, id] of model.profileCharacterIds.entries()) {
      assert.equal(t[id], expectedNames[language][index]);
      assert.equal(nodes(cards[index]).find(n => n.type === 'Text').props.children[0], expectedNames[language][index]);
    }
  }
  console.log('PASS: approved names in all 3 locales, actual locale preference order/English fallback, unchanged 8 IDs/storage key/v1 selection records.');
  // Check actual PNG alpha pixels, not just square frame sizes. Every motif and
  // even isolated source specks must fit; body centers/heights are separate.
  for (const size of [64, 80, 96]) {
    let heroHeight;
    for (const [id, frame] of Object.entries(presentation.profileCharacterFraming)) {
      const path = id === 'main' ? 'apps/mobile/assets/characters/main-fullbody.png'
        : `apps/mobile/assets/characters/profile/${id}.png`;
      const image = await loadImage(path), canvas = createCanvas(image.width, image.height), ctx = canvas.getContext('2d');
      assert.equal(image.width, frame.canvas); assert.equal(image.height, frame.canvas);
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
      const bounds = [image.width, image.height, 0, 0];
      for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
        if (!pixels[(y * image.width + x) * 4 + 3]) continue;
        bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x + 1); bounds[3] = Math.max(bounds[3], y + 1);
      }
      assert.deepEqual(bounds, [...frame.art], `${id}: review framing if artwork changes`);
      const tree = picker.ProfileCharacterImage({ id, size }), imageNode = nodes(tree).find(n => n.type === 'Image');
      const { width, height, left, top } = imageNode.props.style, scale = width / image.width;
      assert.equal(width, height); assert.equal(tree.props.style.width, size);
      assert.ok(left + bounds[0] * scale >= 0 && top + bounds[1] * scale >= 0, `${id}: leading artwork clipped`);
      assert.ok(left + bounds[2] * scale <= size && top + bounds[3] * scale <= size, `${id}: trailing artwork clipped`);
      const body = frame.body, bodyHeight = (body[3] - body[1]) * scale;
      assert.ok(Math.abs(left + (body[0] + body[2]) / 2 * scale - size / 2) < 1e-8);
      assert.ok(Math.abs(top + (body[1] + body[3]) / 2 * scale - size / 2) < 1e-8);
      if (id === 'main') heroHeight = bodyHeight;
      else assert.ok(Math.abs(bodyHeight / heroHeight - 0.72) < 1e-8, 'companion body hierarchy');
    }
  }
  assert.equal(picker.ProfileCharacterImage({ id: 'default', size: 96 }), null);
  console.log('PASS: actual alpha bounds of all 7 PNGs fit at 64/80/96pt; body centers align and companion height is 72% of main.');

  const labels = { ko: '캐릭터 선택', en: 'Choose character', ja: 'キャラクターを選ぶ' };
  for (language of Object.keys(labels)) for (dark of [false, true]) {
    for (const width of [320, 360, 390, 430, 768]) for (const fontScale of [1, 1.2, 1.21, 1.6, 2, 3.2]) {
      dimensions = { width, height: 568, fontScale };
      for (const id of model.profileCharacterIds) {
        let opened = 0;
        const button = picker.ProfileCharacterButton({ id, size: 136, onPress: () => opened++ });
        const tree = nodes(button), texts = tree.filter(n => n.type === 'Text');
        assert.equal(button.props.accessibilityRole, 'button'); assert.equal(button.props.accessible, true);
        assert.equal(button.props.accessibilityLabel, labels[language]);
        assert.equal(button.props.accessibilityValue.text, expectedNames[language][model.profileCharacterIds.indexOf(id)]);
        assert.equal(tree.filter(n => n.type === 'Button').length, 1, 'one touch/accessibility target');
        assert.equal(texts.length, 1); assert.equal(texts[0].props.children[0], labels[language]);
        assert.equal(texts[0].props.numberOfLines, undefined); assert.notEqual(texts[0].props.allowFontScaling, false);
        assert.ok(tree.some(n => n.props.accessibilityElementsHidden && n.props.importantForAccessibility === 'no-hide-descendants'));
        button.props.onPress(); assert.equal(opened, 1);
        if (fontScale > 1.2) {
          assert.equal(button.props.style.height, undefined, 'large text needs intrinsic button height');
          assert.equal(button.props.style.width, '100%');
        } else {
          assert.equal(button.props.style.height, 136); assert.equal(button.props.style.borderRadius, 68);
          // At most 2 scaled caption lines + separate 64pt artwork + gap/padding.
          assert.ok(64 + 4 + 2 * 16 * fontScale + 24 <= 136);
        }
      }
      for (const [ready, error, saving] of [[true, false, false], [false, false, false], [false, true, false], [true, true, false], [true, false, true]]) {
        let selected, closed = 0, retried = 0;
        const state = { id: 'main', ready, error, saving, select: id => { selected = id; }, retry: () => retried++ };
        const modal = picker.ProfileCharacterPicker({ visible: true, state, onClose: () => closed++ }), tree = nodes(modal);
        const cards = tree.filter(n => n.props.testID?.startsWith('profile-character-'));
        assert.equal(cards.length, 8);
        for (const card of cards) {
          const id = card.props.testID.slice('profile-character-'.length);
          const name = expectedNames[language][model.profileCharacterIds.indexOf(id)];
          assert.equal(card.props.accessibilityLabel, name);
          assert.equal(nodes(card).find(n => n.type === 'Text').props.children[0], name);
          assert.equal(card.props.style.height, undefined); assert.equal(card.props.style.overflow, undefined);
          assert.equal(card.props.style.width, width < 360 || fontScale > 1.2 ? '100%' : '47%');
          assert.equal(card.props.disabled, !ready || saving);
          assert.equal(card.props.accessibilityState.selected, id === 'main');
          assert.equal(card.props.accessibilityState.disabled, !ready || saving);
          if (ready && !saving) { card.props.onPress(); assert.equal(selected, id); }
          for (const text of nodes(card).filter(n => n.type === 'Text')) assert.equal(text.props.numberOfLines, undefined);
          if (card.props.style.width !== '100%') {
            const panelWidth = Math.min(540, width - 40), cardWidth = (panelWidth - 40) * 0.47;
            assert.ok(cardWidth - 16 - 4 >= 96, 'two-column card must contain full image stage');
          }
        }
        assert.ok(nodes(tree.find(n => n.type === 'ScrollView')).some(n => n.props.accessibilityRole === 'header'), 'large modal heading can scroll');
        const buttons = tree.filter(n => n.type === 'Button' && !n.props.testID);
        buttons.at(-1).props.onPress(); assert.equal(closed, 1);
        if (!ready && error) { buttons[0].props.onPress(); assert.equal(retried, 1); }
        modal.props.onRequestClose(); assert.equal(closed, 2);
      }
    }
  }
  console.log('PASS: actual button/picker JSX across KO/EN/JA, light/dark, 320–768pt and font scales 1–3.2; single accessible action, intrinsic large-text layout, scrollable heading, 8 IDs, save/error/retry/close states. Native text wrapping and screen-reader traversal still require device QA.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
