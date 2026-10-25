// 수행평가 일정 안내판 (심화) - Code.gs
// 기본 실습 코드에 세 가지를 더했어요.
//  1) 시트 메뉴에 '📅 일정 안내판 → 일정 화면 보기' 버튼
//  2) 웹앱에서 새 일정을 바로 추가하기
//  3) 시트 편집 권한이 있는 사람(선생님)만 추가할 수 있게 확인하기

// 시트를 열 때마다 위쪽 메뉴에 버튼을 만들어요.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📅 일정 안내판')
    .addItem('일정 화면 보기', 'showBoard')
    .addToUi();
}

// 메뉴를 누르면 시트 위에 일정 화면을 띄워요.
function showBoard() {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(1100)
    .setHeight(720);
  SpreadsheetApp.getUi().showModalDialog(html, '수행평가 일정 안내판');
}

// 웹앱 주소로 열었을 때
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('수행평가 일정 안내판')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function sheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('일정');
  if (!sheet) throw new Error("'일정' 시트를 찾을 수 없어요. 시트 탭 이름을 확인해 주세요.");
  return sheet;
}

// 지금 화면을 보는 사람이 시트 편집자(선생님)인지 확인해요.
function canEdit() {
  const me = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!me) return false;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const editors = ss.getEditors().map(u => u.getEmail().toLowerCase());
  const owner = ss.getOwner();
  if (owner) editors.push(owner.getEmail().toLowerCase());
  return editors.includes(me);
}

// 일정 목록과 '추가할 수 있는 사람인지'를 함께 보내요.
function getSchedule() {
  const values = sheet_().getDataRange().getValues();
  const header = values.shift();
  const tz = Session.getScriptTimeZone();
  const items = values
    .filter(row => row[0] !== '')
    .map(row => {
      const item = {};
      header.forEach((name, i) => {
        const v = row[i];
        item[name] = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v);
      });
      return item;
    });
  return { items: items, canEdit: canEdit() };
}

// 새 일정을 '일정' 시트 맨 아래에 한 줄 추가해요.
function addSchedule(form) {
  if (!canEdit()) throw new Error('일정은 시트 편집 권한이 있는 선생님만 추가할 수 있어요.');

  const date = String(form.date || '').trim();
  const subject = String(form.subject || '').trim().slice(0, 20);
  const title = String(form.title || '').trim().slice(0, 40);
  const prep = String(form.prep || '').trim().slice(0, 40);
  const note = String(form.note || '').trim().slice(0, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('날짜를 골라 주세요.');
  if (!subject || !title) throw new Error('과목과 평가명은 꼭 적어 주세요.');

  const [y, m, d] = date.split('-').map(Number);
  const lock = LockService.getScriptLock();       // 동시에 추가해도 겹치지 않게
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(y, m - 1, d), subject, title, prep, note]);
  } finally {
    lock.releaseLock();
  }
  return getSchedule();
}
