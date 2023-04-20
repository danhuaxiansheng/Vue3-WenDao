import { signature } from "./signature.js";
import { Message } from "element-plus";
export function exporter(opt) {
  let defaults = {
    fileType: "xlsx",
    titles: [],
    dataParams: "",
  };
  let params = { ...defaults, ...opt };
  //创建iframe
  let downloadIf = document.createElement("iframe");
  downloadIf.id = "downloadHelper";
  downloadIf.style.display = "none";
  document.body.appendChild(downloadIf);
  let doc = downloadIf.contentWindow.document;
  //写入格尔参数
  let data = JSON.parse(JSON.stringify(params));
  delete data.action;
  params.action = signature(params.action, data);
  doc.open();
  doc.write(""); //微软为doc.clear()
  doc.writeln(
    `<html><body><form id='downloadForm' height='0' width='0' name='downloadForm' method='POST' action='${params.action}'>`
  );
  //写参数
  for (var key in params) {
    doc.writeln(`<input type='hidden' name='${key}' value='${params[key]}'>`);
  }
  doc.writeln("</form><body></html>'>");
  doc.close();
  var form = doc.forms[0];
  if (form) {
    form.submit();
    Message({ message: "下载中，请稍候！", type: "success", duration: 2000 });
  }
}
