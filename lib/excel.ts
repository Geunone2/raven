import { utils as xlsxUtils, writeFile as writeXlsxFile } from "xlsx";

// LootTable/MemberPanel/ContentRewardSettlementRow 등 여러 곳에서 json_to_sheet
// → book_new → book_append_sheet → writeFile로 이어지는 동일한 플러밍이
// 중복돼 있던 것을 하나로 뺐다(2026-08-15). 행을 어떤 모양으로 만들지(어떤
// 필드를 어떤 한글 헤더로 내보낼지)는 여전히 호출부 책임 — 여기서는 시트/파일
// 만드는 부분만 공유한다.
export function exportToExcel(data: object[], sheetName: string, filename: string) {
  const sheet = xlsxUtils.json_to_sheet(data);
  const workbook = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(workbook, sheet, sheetName);
  writeXlsxFile(workbook, filename);
}
