// 수행평가 일정 안내판 - Code.gs
// 시트 '일정'의 내용을 읽어 웹앱 화면으로 보내 줍니다.

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('수행평가 일정 안내판')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSchedule() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('일정');
  const values = sheet.getDataRange().getValues();
  const header = values.shift();               // 첫 행은 머리글
  const tz = Session.getScriptTimeZone();

  return values
    .filter(row => row[0] !== '')              // 빈 행 건너뛰기
    .map(row => {
      const item = {};
      header.forEach((name, i) => {
        const v = row[i];
        item[name] = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v);
      });
      return item;
    });
}
