const XLSX = require("xlsx");

exports.downloadXLSX = (req, res, data) => {
  try {
    const sheetName = "DiningOutMenus"; 
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${sheetName}.xlsx`
    );

    const buffer = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
    res.end(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" }); 
  }
};
