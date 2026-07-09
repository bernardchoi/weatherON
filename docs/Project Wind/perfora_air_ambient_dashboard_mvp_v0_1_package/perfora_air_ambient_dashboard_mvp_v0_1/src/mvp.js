const scenarios = {
  calm: {
    label: 'Calm', temp: '22°', symbol: '☼', humidity: '48%', wind: 'NE 1.8', windSpeed: 1.8, aqi: 12, pm: 12, uv: 2,
    density: 'calm', surface: 'still', status: '차분함',
    summary: '공기가 가볍고 안정적입니다.',
    recommendation: '창을 조금 열어두고 가벼운 산책을 준비해도 좋습니다.',
    airQuality: 'Excellent', schedule: '2 events', scheduleText: '오후 일정이 여유롭습니다.',
    indoor: 'Fresh', indoorText: '실내 CO₂와 습도가 모두 안정권입니다.', signal: 'Quiet', signalText: '중요 알림 없음.',
    windHeading: 'NE 1.8 m/s', windCopy: '매우 약한 북동풍입니다. 실내 환기와 산책 모두 부담이 적습니다.',
    flowTitle: '환기 유지', flowCopy: '외부 공기질이 좋아 짧은 환기보다 지속 환기에 가깝게 운용해도 괜찮습니다.',
    homeAirHeadline: '집 안 공기가 산뜻합니다', homeAirCopy: '공기청정기는 저소음 모드로 충분합니다.',
    dayHeadline: '일정 밀도가 낮습니다', dayCopy: '오전 업무 후 충분한 여백이 있습니다.',
    timeline: [18, 22, 26, 30, 28, 34, 40, 32, 28, 24, 20, 18], hourly: [18, 22, 28, 32, 35, 30]
  },
  normal: {
    label: 'Normal', temp: '24°', symbol: '☼', humidity: '62%', wind: 'NW 3.2', windSpeed: 3.2, aqi: 18, pm: 18, uv: 3,
    density: 'normal', surface: 'air', status: '안정',
    summary: '공기가 살짝 습하지만 안정적입니다.',
    recommendation: '짧은 환기 후 집중하기 좋은 상태입니다.',
    airQuality: 'Good', schedule: '4 events', scheduleText: '15:30 집중 시간이 있습니다.',
    indoor: 'Balanced', indoorText: '공기청정기 자동 모드 유지.', signal: 'Quiet', signalText: '중요 알림 없음.',
    windHeading: 'NW 3.2 m/s', windCopy: '약한 북서풍입니다. 실내 환기에는 부담이 적습니다.',
    flowTitle: '10분 환기 추천', flowCopy: '실내 공기와 외부 공기 상태가 모두 안정적입니다.',
    homeAirHeadline: '거실 공기가 안정적입니다', homeAirCopy: '공기청정기는 자동 모드, 습도 센서는 정상 범위입니다.',
    dayHeadline: '오후에 집중 구간이 있습니다', dayCopy: '회의 사이의 90분을 깊은 작업 시간으로 확보하세요.',
    timeline: [22, 28, 34, 40, 36, 44, 52, 48, 38, 32, 28, 24], hourly: [28, 34, 42, 52, 48, 38]
  },
  live: {
    label: 'Live', temp: '25°', symbol: '◌', humidity: '69%', wind: 'W 5.4', windSpeed: 5.4, aqi: 24, pm: 24, uv: 4,
    density: 'live', surface: 'air', status: '변화 중',
    summary: '바람과 습도가 조금씩 변하고 있습니다.',
    recommendation: '외출 전 1시간 흐름을 한 번 더 확인하세요.',
    airQuality: 'Good', schedule: '5 events', scheduleText: '오후 일정 밀도가 올라갑니다.',
    indoor: 'Active', indoorText: '공기청정기 풍량이 자동으로 조정 중입니다.', signal: 'Notice', signalText: '비 소식 가능성이 있습니다.',
    windHeading: 'W 5.4 m/s', windCopy: '서풍이 조금 강해졌습니다. 체감 온도와 소음이 약간 달라질 수 있습니다.',
    flowTitle: '상태 변화 감지', flowCopy: '풍향이 바뀌고 있습니다. 우산보다 얇은 겉옷 확인이 우선입니다.',
    homeAirHeadline: '실내 공기가 움직이고 있습니다', homeAirCopy: '청정기와 습도 센서가 자동 보정 중입니다.',
    dayHeadline: '일정 흐름이 촘촘해집니다', dayCopy: '오후 이동 전 알림을 정리하면 좋습니다.',
    timeline: [26, 34, 46, 52, 48, 58, 68, 62, 54, 42, 36, 30], hourly: [36, 48, 58, 68, 62, 52]
  },
  alert: {
    label: 'Alert', temp: '26°', symbol: '☁', humidity: '78%', wind: 'SW 7.8', windSpeed: 7.8, aqi: 41, pm: 41, uv: 2,
    density: 'alert', surface: 'signal', status: '확인 필요',
    summary: '습도와 일정 밀도가 높아졌습니다.',
    recommendation: '환기보다 제습을 먼저 켜고, 15:30 전 알림을 정리하세요.',
    airQuality: 'Moderate', schedule: '7 events', scheduleText: '일정 충돌 가능성이 있습니다.',
    indoor: 'Humid', indoorText: '제습 또는 공기 순환이 필요합니다.', signal: 'Notice', signalText: '두 가지 행동을 권장합니다.',
    windHeading: 'SW 7.8 m/s', windCopy: '남서풍이 강해졌고 습도가 높습니다. 긴 환기보다 짧은 순환이 안전합니다.',
    flowTitle: '제습 우선', flowCopy: '외부 습도가 높습니다. 긴 환기보다 실내 제습과 짧은 순환을 권장합니다.',
    homeAirHeadline: '실내 습도가 높습니다', homeAirCopy: '제습기 또는 공기청정기 강도 조절이 필요합니다.',
    dayHeadline: '일정 밀도가 높습니다', dayCopy: '핵심 일정 외 알림을 줄이고 집중 구간을 보호하세요.',
    timeline: [34, 48, 58, 64, 62, 74, 86, 80, 72, 58, 46, 38], hourly: [44, 56, 68, 82, 76, 66]
  }
};

const devices = [
  { icon: '◌', name: 'Air Purifier', place: 'Living Room', status: 'Good', value: 'Auto' },
  { icon: '▣', name: 'Robot Vacuum', place: 'Hallway', status: 'Ready', value: '75%' },
  { icon: '◍', name: 'Humidity Sensor', place: 'Bedroom', status: 'Good', value: '62%' },
  { icon: '⌁', name: 'Window Sensor', place: 'Kitchen', status: 'Closed', value: 'OK' }
];

const schedule = [
  { time: '10:00', title: 'Design Sync', desc: 'Perfora tokens review', density: 'normal', width: 46 },
  { time: '13:00', title: 'Client Meeting', desc: 'Ambient dashboard demo', density: 'normal', width: 52 },
  { time: '15:30', title: 'Focus Time', desc: 'Deep work session', density: 'low', width: 34 },
  { time: '19:00', title: 'Gym', desc: 'Recovery and light cardio', density: 'low', width: 28 }
];

let currentScenario = 'normal';
let currentMode = 'day';
let currentScreen = 'home';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderTimeline(values, containerId = 'homeTimeline') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const labels = ['06', '', '09', '', '12', '', '15', '', '18', '', '21', ''];
  container.innerHTML = values.map((height, idx) => `<span class="timeline-bar" data-label="${labels[idx] || ''}" style="height:${height}px"></span>`).join('');
}

function renderHourly(values) {
  const hours = ['09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
  const container = document.getElementById('hourlyList');
  if (!container) return;
  container.innerHTML = values.map((value, idx) => `
    <div class="hour-row">
      <span>${hours[idx]}</span>
      <span class="track"><span class="fill" style="--w:${Math.min(100, value)}%"></span></span>
      <b>${value}</b>
    </div>
  `).join('');
}

function renderDevices() {
  const container = document.getElementById('deviceList');
  if (!container) return;
  container.innerHTML = devices.map(device => `
    <article class="device-card">
      <span class="device-icon" aria-hidden="true">${device.icon}</span>
      <span><h3>${device.name}</h3><p>${device.place}</p></span>
      <span class="device-status">${device.value}</span>
    </article>
  `).join('');
}

function renderSchedule() {
  const container = document.getElementById('scheduleList');
  if (!container) return;
  const activeScenario = scenarios[currentScenario];
  const adjusted = schedule.map((item, idx) => {
    const bump = currentScenario === 'alert' && idx < 2 ? 24 : currentScenario === 'live' ? 12 : 0;
    const density = bump > 18 ? 'high' : item.density;
    return { ...item, width: Math.min(94, item.width + bump), density };
  });
  container.innerHTML = adjusted.map(item => `
    <article class="schedule-row" data-density="${item.density}">
      <span class="schedule-time">${item.time}</span>
      <span><h3>${item.title}</h3><p>${item.desc}</p></span>
      <span class="schedule-meter"><span style="--w:${item.width}%"></span></span>
    </article>
  `).join('');
}

function updateScenario(name) {
  currentScenario = name;
  const data = scenarios[name];
  document.body.dataset.scenario = name;
  document.documentElement.style.setProperty('--pa-current-wind-speed', data.windSpeed);

  setText('temperatureValue', data.temp);
  setText('weatherSymbol', data.symbol);
  setText('humidityValue', data.humidity);
  setText('windValue', data.wind);
  setText('aqiValue', data.aqi);
  setText('statusPill', data.label);
  setText('heroSummary', data.summary);
  setText('recommendationText', data.recommendation);
  setText('airQualityLabel', data.airQuality);
  setText('pmValue', data.pm);
  setText('scheduleLabel', data.schedule);
  setText('scheduleText', data.scheduleText);
  setText('indoorLabel', data.indoor);
  setText('indoorText', data.indoorText);
  setText('signalLabel', data.signal);
  setText('signalText', data.signalText);
  setText('ringWindValue', data.windSpeed.toFixed(1));
  setText('windHeading', data.windHeading);
  setText('windCopy', data.windCopy);
  setText('feelsLikeChip', data.temp);
  setText('humidityChip', data.humidity);
  setText('uvChip', data.uv);
  setText('flowRecommendationTitle', data.flowTitle);
  setText('flowRecommendationCopy', data.flowCopy);
  setText('homeAirHeadline', data.homeAirHeadline);
  setText('homeAirCopy', data.homeAirCopy);
  setText('dayFlowHeadline', data.dayHeadline);
  setText('dayFlowCopy', data.dayCopy);
  setText('timelineMeta', `${name} density`);

  const hero = $('.atmosphere-hero');
  if (hero) {
    hero.dataset.paSurface = data.surface;
    hero.dataset.state = name;
    const field = $('.pa-density-field', hero);
    if (field) field.dataset.paDensity = data.density;
  }
  $$('.seg-btn').forEach(btn => btn.classList.toggle('is-active', btn.dataset.scenarioButton === name));
  const progress = $('.ring-progress');
  if (progress) progress.style.strokeDasharray = `${Math.min(92, Math.round(data.windSpeed * 9))} 100`;
  const needle = $('#windNeedle');
  if (needle) {
    const angle = { calm: 35, normal: -45, live: -88, alert: -132 }[name] || -45;
    needle.style.transform = `rotate(${angle}deg)`;
  }
  renderTimeline(data.timeline);
  renderHourly(data.hourly);
  renderSchedule();
  updateReadout();
}

function updateMode(name) {
  currentMode = name;
  document.body.dataset.paMode = name;
  $$('.mode-swatch').forEach(btn => btn.classList.toggle('is-active', btn.dataset.modeButton === name));
  const kicker = { day: 'Good Morning', dusk: 'Good Evening', rainy: 'Rainy Mode', night: 'Good Night' }[name] || 'Good Morning';
  setText('headerKicker', kicker);
  updateReadout();
}

function navigate(screen) {
  currentScreen = screen;
  document.body.dataset.screen = screen;
  $$('.screen-view').forEach(view => view.classList.toggle('is-active', view.dataset.view === screen));
  $$('.pa-flow-dock__item').forEach(btn => {
    if (btn.dataset.nav === screen) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  const titles = { home: 'Yokohama', flow: 'Air Flow', homeair: 'Living Room', schedule: 'Day Flow', modes: 'Modes' };
  setText('screenTitle', titles[screen] || 'Yokohama');
  updateReadout();
}

function toggleClass(name, active) {
  document.body.classList.toggle(name, active);
  updateReadout();
}

function updateReadout() {
  const data = scenarios[currentScenario];
  const readout = document.getElementById('tokenReadout');
  if (!readout) return;
  const activeClasses = ['reduced-motion', 'reduced-transparency', 'high-contrast', 'low-power', 'text-first'].filter(cls => document.body.classList.contains(cls));
  readout.innerHTML = [
    ['screen', currentScreen],
    ['mode', currentMode],
    ['state', currentScenario],
    ['surface', data.surface],
    ['density', data.density],
    ['flow', data.windSpeed >= 7 ? 'gust' : data.windSpeed >= 5 ? 'slow' : 'drift'],
    ['a11y', activeClasses.length ? activeClasses.join(', ') : 'default']
  ].map(([label, value]) => `<div class="token-row"><span>${label}</span><code>${value}</code></div>`).join('');
}

function bindEvents() {
  $$('.seg-btn').forEach(btn => btn.addEventListener('click', () => updateScenario(btn.dataset.scenarioButton)));
  $$('.mode-swatch').forEach(btn => btn.addEventListener('click', () => updateMode(btn.dataset.modeButton)));
  $$('.pa-flow-dock__item').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
  $$('[data-toggle-class]').forEach(input => {
    toggleClass(input.dataset.toggleClass, input.checked);
    input.addEventListener('change', () => toggleClass(input.dataset.toggleClass, input.checked));
  });
  const gust = document.getElementById('gustButton');
  if (gust) {
    gust.addEventListener('click', () => {
      document.body.classList.remove('is-gusting');
      void document.body.offsetWidth;
      document.body.classList.add('is-gusting');
    });
  }
}

bindEvents();
renderDevices();
renderSchedule();
updateMode('day');
updateScenario('normal');
navigate('home');
